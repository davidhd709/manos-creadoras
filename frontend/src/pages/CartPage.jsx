import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';
import ShippingProfileBlock from '../components/ShippingProfileBlock';
import { getProductImage, handleImgError } from '../lib/productImage';

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
const MinusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>);
const InfoIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>);

const PAYMENT_METHODS = [
  {
    id: 'whatsapp',
    title: 'Prefiero que me contacten por WhatsApp',
    desc: 'El equipo de soporte o el vendedor te escribirá para acordar el pago y los detalles de entrega.',
    icon: '💬',
  },
  {
    id: 'transfer',
    title: 'Prefiero coordinar una transferencia',
    desc: 'Te enviaremos los datos por correo y WhatsApp una vez confirmado el pedido.',
    icon: '🏦',
  },
  {
    id: 'cod',
    title: 'Prefiero pagar al recibir el pedido',
    desc: 'Sujeto a disponibilidad en tu zona. El equipo te confirmará si es posible para tu pedido.',
    icon: '📦',
  },
];

const SHIPPING_ZONES = [
  { id: 'main_city', label: 'Ciudad principal', days: '2 a 4 días', estimate: 12000 },
  { id: 'regional', label: 'Capital regional', days: '3 a 6 días', estimate: 18000 },
  { id: 'rural', label: 'Otras zonas', days: '5 a 8 días', estimate: 25000 },
];

const FREE_SHIPPING_THRESHOLD = 250000;

function formatPrice(value) {
  const n = Number(value || 0);
  return `$${n.toLocaleString('es-CO')}`;
}

export default function CartPage() {
  const {
    items,
    subtotal,
    savings,
    count,
    remove,
    clear,
    updateQuantity,
    revalidate,
    revalidating,
    warnings,
    dismissWarning,
  } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [customerNotes, setCustomerNotes] = useState('');
  const [shippingZone, setShippingZone] = useState('main_city');
  const [shippingReady, setShippingReady] = useState(false);

  const handleShippingReady = useCallback((ready) => setShippingReady(ready), []);

  // Revalidar stock/precios al entrar a la página (una sola vez)
  useEffect(() => {
    if (items.length > 0) {
      revalidate().then((res) => {
        if (res?.changed) {
          toast.info('Actualizamos tu carrito con la información más reciente');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shipping = useMemo(
    () => SHIPPING_ZONES.find((z) => z.id === shippingZone) || SHIPPING_ZONES[0],
    [shippingZone],
  );

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = freeShipping ? 0 : shipping.estimate;
  const totalToPay = subtotal + shippingCost;
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const hasInvalidItems = items.some((i) => !i.product || i.product.stock < i.quantity);

  const checkout = async () => {
    if (!user) {
      toast.error('Inicia sesión para realizar el pedido');
      return;
    }
    if (items.length === 0) {
      toast.info('Tu carrito está vacío');
      return;
    }
    if (hasInvalidItems) {
      toast.error('Hay productos con stock insuficiente. Revisa tu carrito.');
      return;
    }
    if (user.role === 'buyer' && !shippingReady) {
      toast.error('Completa tu dirección de envío para continuar');
      document.getElementById('shipping-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    track('begin_checkout', { value: subtotal, num_items: count });
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
      const raw = err.response?.data?.message || 'Error al crear el pedido';
      const msg = Array.isArray(raw) ? raw[0] : raw;
      toast.error(msg);
      if (/perfil|dirección|direccion|teléfono|telefono/i.test(msg)) {
        setShippingReady(false);
        document.getElementById('shipping-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (/stock|disponible/i.test(msg)) {
        await revalidate();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const askClear = () => {
    if (items.length === 0) return;
    if (window.confirm('¿Vaciar todo el carrito? Esta acción no se puede deshacer.')) {
      clear();
      toast.info('Carrito vaciado');
    }
  };

  return (
    <main className="page" role="main">
      <Seo title="Tu carrito" description="Revisa tus piezas y confirma tu pedido." noindex />
      <div className="section-header">
        <div>
          <h1 className="section-title">Tu carrito</h1>
          <p className="section-subtitle">
            {count} {count === 1 ? 'unidad' : 'unidades'} · {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        {items.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/productos" className="btn secondary">Seguir comprando</Link>
            <button type="button" className="link-btn" onClick={askClear}>Vaciar carrito</button>
          </div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="cart-warnings" role="status" aria-live="polite">
          {warnings.map((w) => (
            <div key={`${w.productId}-${w.type}`} className={`cart-warning cart-warning-${w.type}`}>
              <InfoIcon />
              <div>
                <strong>{w.title}</strong>
                <span>{w.message}</span>
              </div>
              <button type="button" className="link-btn" onClick={() => dismissWarning(w.productId)} aria-label="Cerrar aviso">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <h3>Tu carrito está vacío</h3>
          <p className="muted">Explora nuestro catálogo y encuentra piezas únicas</p>
          <Link to="/productos" className="btn accent" style={{ marginTop: '1rem' }}>Explorar catálogo</Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="grid" style={{ gap: '0.75rem' }}>
            {user?.role === 'buyer' && (
              <div id="shipping-block">
                <ShippingProfileBlock onReadyChange={handleShippingReady} />
              </div>
            )}
            {items.map((i) => {
              const unit = i.product.isPromotion ? i.product.promotionPrice : i.product.price;
              const original = i.product.price;
              const lineSavings = i.product.isPromotion
                ? Math.max(0, (original - unit)) * i.quantity
                : 0;
              const maxStock = i.product.stock || 0;
              const overStock = i.quantity > maxStock;
              const lowStock = !overStock && maxStock > 0 && maxStock <= 3;
              return (
                <div key={i.product._id} className={`cart-item ${overStock ? 'cart-item-error' : ''}`}>
                  <Link to={`/productos/${i.product._id}`} aria-label={`Ver ${i.product.title}`}>
                    <img
                      className="cart-item-img"
                      src={getProductImage(i.product)}
                      alt={`${i.product.title} en carrito`}
                      loading="lazy"
                      onError={handleImgError}
                    />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/productos/${i.product._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <strong>{i.product.title}</strong>
                    </Link>
                    <span className="muted" style={{ display: 'block', fontSize: '0.82rem' }}>
                      {i.product.artisan?.name}
                      {' · '}
                      {i.product.isPromotion && (
                        <span className="price-old" style={{ marginRight: '0.35rem', fontSize: '0.78rem' }}>
                          {formatPrice(original)}
                        </span>
                      )}
                      {formatPrice(unit)} c/u
                    </span>
                    {lineSavings > 0 && (
                      <span className="cart-line-savings">Ahorras {formatPrice(lineSavings)}</span>
                    )}
                    {overStock && (
                      <span className="cart-line-error">
                        Solo hay {maxStock} disponibles. Ajusta la cantidad.
                      </span>
                    )}
                    {!overStock && lowStock && (
                      <span className="cart-line-warning">¡Solo quedan {maxStock}!</span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button className="btn-icon" onClick={() => updateQuantity(i.product._id, i.quantity - 1)} aria-label="Reducir cantidad" style={{ padding: '0.25rem' }}><MinusIcon /></button>
                      <span style={{ fontWeight: 600, minWidth: '1.5rem', textAlign: 'center' }}>{i.quantity}</span>
                      <button
                        className="btn-icon"
                        onClick={() => updateQuantity(i.product._id, i.quantity + 1)}
                        disabled={i.quantity >= maxStock}
                        aria-label="Aumentar cantidad"
                        style={{ padding: '0.25rem', opacity: i.quantity >= maxStock ? 0.4 : 1 }}
                      ><PlusIcon /></button>
                      {i.quantity >= maxStock && maxStock > 0 && (<span style={{ fontSize: '0.72rem', color: 'var(--warning)' }}>Máx</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="price-main">{formatPrice(unit * i.quantity)}</span>
                    {i.product.isPromotion && (
                      <span className="price-old" style={{ display: 'block', fontSize: '0.78rem' }}>
                        {formatPrice(original * i.quantity)}
                      </span>
                    )}
                  </div>
                  <button className="btn-icon" onClick={() => remove(i.product._id)} aria-label={`Eliminar ${i.product.title} del carrito`}><TrashIcon /></button>
                </div>
              );
            })}

            <section className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>Zona de envío</h3>
              <p className="muted" style={{ margin: '0 0 1rem', fontSize: '0.88rem' }}>
                Estimación de costo y tiempo. El artesano confirmará el valor final.
              </p>
              <div className="shipping-zones">
                {SHIPPING_ZONES.map((z) => {
                  const active = shippingZone === z.id;
                  return (
                    <label key={z.id} className={`shipping-zone ${active ? 'shipping-zone-active' : ''}`}>
                      <input
                        type="radio"
                        name="shippingZone"
                        checked={active}
                        onChange={() => setShippingZone(z.id)}
                      />
                      <div>
                        <strong>{z.label}</strong>
                        <span className="muted">{z.days}</span>
                      </div>
                      <span className="shipping-zone-price">
                        {freeShipping ? <s style={{ color: 'var(--text-secondary)' }}>{formatPrice(z.estimate)}</s> : formatPrice(z.estimate)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>Cómo prefieres que coordinemos contigo</h3>
              <p className="muted" style={{ margin: '0 0 1rem', fontSize: '0.88rem' }}>
                Por ahora, los pedidos se confirman en la plataforma y el pago se coordina directamente con el equipo de soporte o el vendedor. Te contactaremos para acordar el método de pago disponible y confirmar los detalles de entrega.
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
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
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

            {!freeShipping && remainingForFree > 0 && (
              <div className="cart-progress">
                <div className="cart-progress-bar">
                  <div
                    className="cart-progress-fill"
                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
                <p className="muted" style={{ fontSize: '0.82rem', margin: '0.5rem 0 0' }}>
                  Te faltan <strong style={{ color: 'var(--accent-dark)' }}>{formatPrice(remainingForFree)}</strong> para envío gratis
                </p>
              </div>
            )}

            {freeShipping && (
              <div className="cart-free-shipping">
                <CheckBadge /> ¡Tu pedido tiene envío gratis!
              </div>
            )}

            <div className="cart-summary-row">
              <span>Subtotal ({count} {count === 1 ? 'pieza' : 'piezas'})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="cart-summary-row" style={{ color: 'var(--success)' }}>
                <span>Ahorro por ofertas</span>
                <span>− {formatPrice(savings)}</span>
              </div>
            )}
            <div className="cart-summary-row">
              <span>Envío estimado</span>
              <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
            </div>
            <div className="cart-summary-total">
              <span>Total estimado</span>
              <span>{formatPrice(totalToPay)}</span>
            </div>

            <button
              className="btn accent"
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
              onClick={checkout}
              disabled={
                submitting
                || items.length === 0
                || hasInvalidItems
                || revalidating
                || (user?.role === 'buyer' && !shippingReady)
              }
              aria-label="Confirmar pedido"
            >
              {submitting
                ? 'Procesando...'
                : revalidating
                  ? 'Validando…'
                  : hasInvalidItems
                    ? 'Revisa el stock'
                    : user?.role === 'buyer' && !shippingReady
                      ? 'Completa tu envío'
                      : 'Confirmar pedido'}
            </button>

            <div className="cart-trust">
              <span><LockIcon /> Pago coordinado con soporte</span>
              <span><CheckBadge /> Artesanos verificados</span>
            </div>

            {!user && (
              <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <Link to="/login" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Inicia sesión</Link> para completar tu compra
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function CheckBadge() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
