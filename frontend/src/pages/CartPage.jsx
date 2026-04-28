import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
const MinusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>);

const PAYMENT_METHODS = [
  {
    id: 'whatsapp',
    title: 'Coordina por WhatsApp',
    desc: 'Te conectamos con el artesano para acordar pago y envio. Lo mas comun y rapido.',
    icon: '💬',
  },
  {
    id: 'transfer',
    title: 'Transferencia bancaria',
    desc: 'Bancolombia, Nequi o Daviplata. Recibes los datos al confirmar el pedido.',
    icon: '🏦',
  },
  {
    id: 'cod',
    title: 'Pago contra entrega',
    desc: 'Disponible en ciudades capitales. Pagas al recibir tu pedido.',
    icon: '📦',
  },
];

export default function CartPage() {
  const { items, total, remove, clear, updateQuantity } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [customerNotes, setCustomerNotes] = useState('');

  const checkout = async () => {
    if (!user) {
      toast.error('Inicia sesion para realizar el pedido');
      return;
    }
    if (items.length === 0) {
      toast.info('Tu carrito esta vacio');
      return;
    }
    setSubmitting(true);
    track('begin_checkout', { value: total, num_items: items.length });
    track('select_payment_method', { payment_method: paymentMethod });
    try {
      const payload = {
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        paymentMethod,
        customerNotes: customerNotes || undefined,
      };
      const { data } = await api.post('/orders', payload);
      track('purchase', {
        transaction_id: data._id,
        value: data.totalOrder,
        currency: 'COP',
        items: items.map((i) => ({ id: i.product._id, qty: i.quantity })),
      });
      clear();
      toast.success('Pedido creado');
      navigate(`/pedido/${data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el pedido';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page" role="main">
      <Seo title="Tu carrito" description="Revisa tus piezas y elige metodo de pago." noindex />
      <div className="section-header">
        <div>
          <h1 className="section-title">Tu carrito</h1>
          <p className="section-subtitle">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
        </div>
        {items.length > 0 && (
          <Link to="/productos" className="btn secondary">Seguir comprando</Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <h3>Tu carrito esta vacio</h3>
          <p className="muted">Explora nuestro catalogo y encuentra piezas unicas</p>
          <Link to="/productos" className="btn accent" style={{ marginTop: '1rem' }}>Explorar catalogo</Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          <div className="grid" style={{ gap: '0.75rem' }}>
            {items.map((i) => {
              const unitPrice = i.product.isPromotion ? i.product.promotionPrice : i.product.price;
              const maxStock = i.product.stock || 999;
              return (
                <div key={i.product._id} className="cart-item">
                  <img className="cart-item-img" src={i.product.images?.[0] || 'https://via.placeholder.com/80x80'} alt={`${i.product.title} en carrito`} loading="lazy" />
                  <div className="cart-item-info">
                    <strong>{i.product.title}</strong>
                    <span className="muted" style={{ display: 'block', fontSize: '0.82rem' }}>
                      {i.product.artisan?.name} &middot; ${unitPrice} c/u
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button className="btn-icon" onClick={() => updateQuantity(i.product._id, i.quantity - 1)} aria-label="Reducir cantidad" style={{ padding: '0.25rem' }}><MinusIcon /></button>
                      <span style={{ fontWeight: 600, minWidth: '1.5rem', textAlign: 'center' }}>{i.quantity}</span>
                      <button className="btn-icon" onClick={() => updateQuantity(i.product._id, i.quantity + 1)} disabled={i.quantity >= maxStock} aria-label="Aumentar cantidad" style={{ padding: '0.25rem', opacity: i.quantity >= maxStock ? 0.4 : 1 }}><PlusIcon /></button>
                      {i.quantity >= maxStock && (<span style={{ fontSize: '0.72rem', color: 'var(--warning)' }}>Max</span>)}
                    </div>
                  </div>
                  <span className="price-main">${unitPrice * i.quantity}</span>
                  <button className="btn-icon" onClick={() => remove(i.product._id)} aria-label={`Eliminar ${i.product.title} del carrito`}><TrashIcon /></button>
                </div>
              );
            })}

            <section className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>Metodo de pago</h3>
              <p className="muted" style={{ margin: '0 0 1rem', fontSize: '0.88rem' }}>
                Por ahora gestionamos los pagos sin pasarela. Elige la opcion que mas te convenga.
              </p>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {PAYMENT_METHODS.map((m) => {
                  const active = paymentMethod === m.id;
                  return (
                    <label
                      key={m.id}
                      className="card"
                      style={{
                        padding: '0.85rem 1rem',
                        cursor: 'pointer',
                        border: `1px solid ${active ? 'var(--accent, #C2410C)' : 'var(--border)'}`,
                        background: active ? 'var(--bg-warm)' : '#fff',
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: '0.85rem',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                      <div>
                        <strong>{m.title}</strong>
                        <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>{m.desc}</p>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.id}
                        checked={active}
                        onChange={() => setPaymentMethod(m.id)}
                        aria-label={m.title}
                      />
                    </label>
                  );
                })}
              </div>
              <label style={{ display: 'block', marginTop: '1rem' }}>
                Notas para el artesano (opcional)
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Color preferido, fecha de entrega, regalo, etc."
                />
              </label>
            </section>
          </div>

          <div className="cart-summary">
            <h2>Resumen del pedido</h2>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="cart-summary-row">
              <span>Envio</span>
              <span style={{ color: 'var(--text-secondary)' }}>Se calcula con el artesano</span>
            </div>
            <div className="cart-summary-total">
              <span>Total productos</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <button
              className="btn accent"
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
              onClick={checkout}
              disabled={submitting || items.length === 0}
              aria-label="Confirmar pedido"
            >
              {submitting ? 'Procesando...' : 'Confirmar pedido'}
            </button>
            {!user && (
              <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <Link to="/login" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Inicia sesion</Link> para completar tu compra
              </p>
            )}
            {user && user.role === 'buyer' && (
              <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Asegurate de tener tu <Link to="/dashboard/mi-perfil" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>direccion de envio</Link> actualizada
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
