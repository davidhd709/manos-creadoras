import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import Seo from '../lib/Seo';
import { useAuth } from '../state/AuthContext';
import { track } from '../lib/analytics';
import {
  HAS_SUPPORT_WHATSAPP,
  SUPPORT_EMAIL,
  buildSupportEmailLink,
  buildSupportWaLink,
} from '../lib/support';

const STATUS_LABEL = {
  awaiting_payment: 'Esperando pago / coordinación',
  pendiente: 'Pago confirmado, en preparación',
  en_proceso: 'En proceso',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const STATUS_FLOW = ['awaiting_payment', 'pendiente', 'en_proceso', 'enviado', 'entregado'];

const PAYMENT_LABEL = {
  whatsapp: 'Coordinación por WhatsApp',
  transfer: 'Transferencia bancaria',
  cod: 'Pago contra entrega',
};

function buildWhatsAppMessage(order) {
  const id = order._id?.slice(-6);
  const total = (order.totalOrder || 0).toLocaleString('es-CO');
  return encodeURIComponent(
    `Hola, soy ${order.shippingAddress?.name || 'un comprador'} en Manos Creadoras. Quiero coordinar el pedido #${id} por $${total} COP. Metodo: ${PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}.`,
  );
}

function getArtisansFromOrder(order) {
  const map = new Map();
  for (const it of order.items || []) {
    const a = it.product?.artisan;
    if (!a) continue;
    const key = a._id || a.toString();
    if (!map.has(key)) map.set(key, a);
  }
  return Array.from(map.values());
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (order) {
      track('view_order_confirmation', {
        order_id: order._id,
        payment_method: order.paymentMethod,
      });
    }
  }, [order]);

  if (loading) return <Spinner />;
  if (error || !order) {
    return (
      <main className="page" role="main">
        <ErrorState title="No pudimos cargar el pedido" message="Verifica el enlace o vuelve al inicio." backTo="/" />
      </main>
    );
  }

  const artisans = getArtisansFromOrder(order);
  const total = (order.totalOrder || 0).toLocaleString('es-CO');
  const id6 = order._id?.slice(-6);
  const supportWaLink = HAS_SUPPORT_WHATSAPP
    ? `${buildSupportWaLink()}&text=${buildWhatsAppMessage(order)}`
    : null;
  const artisanWhatsapp = artisans[0]?.whatsapp;
  const cleanArtisanWa = artisanWhatsapp ? String(artisanWhatsapp).replace(/[^0-9]/g, '') : '';
  const primaryWaLink = cleanArtisanWa
    ? `https://wa.me/${cleanArtisanWa}?text=${buildWhatsAppMessage(order)}`
    : supportWaLink;
  const supportEmailLink = buildSupportEmailLink(
    `Pedido #${id6}`,
    `Hola, soy ${order.shippingAddress?.name || 'un comprador'}. Tengo una consulta sobre el pedido #${id6} por $${total} COP.`,
  );

  return (
    <main className="page" role="main">
      <Seo title={`Pedido #${id6}`} description="Detalles e instrucciones de tu pedido en Manos Creadoras." noindex />
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-light), var(--bg-warm))' }}>
          <div style={{ fontSize: '2.5rem' }}>🎉</div>
          <h1 style={{ margin: '0.5rem 0 0.25rem' }}>Pedido recibido</h1>
          <p className="muted" style={{ margin: 0 }}>Pedido <strong>#{id6}</strong> · Total <strong>${total} COP</strong></p>
          <p className="muted" style={{ marginTop: '0.5rem' }}>Estado: <strong>{STATUS_LABEL[order.status] || order.status}</strong></p>
        </div>

        {order.status !== 'cancelado' && (
          <ol className="order-timeline" aria-label="Progreso del pedido">
            {STATUS_FLOW.map((s, idx) => {
              const currentIdx = STATUS_FLOW.indexOf(order.status);
              const done = currentIdx >= 0 && idx <= currentIdx;
              return (
                <li key={s} className={`order-step ${done ? 'done' : ''}`}>
                  <span className="order-step-dot">{done ? '✓' : idx + 1}</span>
                  <span className="order-step-label">{STATUS_LABEL[s]}</span>
                </li>
              );
            })}
          </ol>
        )}

        <section className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h2 style={{ margin: '0 0 0.5rem' }}>Siguiente paso</h2>
          {order.paymentMethod === 'whatsapp' && (
            <>
              <p>Coordina el pago y el envío directamente con el artesano. Te dejamos el mensaje listo.</p>
              {primaryWaLink ? (
                <a href={primaryWaLink} target="_blank" rel="noopener noreferrer" className="btn accent" style={{ padding: '0.85rem 1.5rem' }}>
                  Coordinar por WhatsApp
                </a>
              ) : (
                <a href={supportEmailLink} className="btn accent" style={{ padding: '0.85rem 1.5rem' }}>
                  Escribirnos por correo
                </a>
              )}
            </>
          )}
          {order.paymentMethod === 'transfer' && (
            <>
              <p>Realiza la transferencia con los datos de pago del artesano. Te enviamos los datos por correo y los puedes pedir también por WhatsApp.</p>
              <ul>
                {artisans.map((a) => {
                  const wa = a.whatsapp ? String(a.whatsapp).replace(/[^0-9]/g, '') : '';
                  return (
                    <li key={a._id || a.toString()}>
                      <strong>{a.name || 'Artesano'}</strong>
                      {wa ? <> · <a href={`https://wa.me/${wa}?text=${buildWhatsAppMessage(order)}`} target="_blank" rel="noopener noreferrer">Pedir datos por WhatsApp</a></> : null}
                    </li>
                  );
                })}
              </ul>
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                Cuando el artesano confirme el pago verás tu pedido en estado "Pago confirmado".
              </p>
            </>
          )}
          {order.paymentMethod === 'cod' && (
            <>
              <p>Pagas al recibir el producto. El artesano se contactará contigo para coordinar el día y hora de entrega.</p>
              <p className="muted" style={{ fontSize: '0.85rem' }}>Disponible solo en ciudades capitales. Si el artesano no puede ofrecer contraentrega te lo informará por WhatsApp.</p>
            </>
          )}
        </section>

        <section className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h2 style={{ margin: '0 0 0.75rem' }}>Productos</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}>
            {(order.items || []).map((it) => (
              <li key={it._id || it.product?._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                <span>{it.quantity} x {it.product?.title || 'Producto'}</span>
                <strong>${(it.totalItem || 0).toLocaleString('es-CO')}</strong>
              </li>
            ))}
          </ul>
        </section>

        {order.shippingAddress && (
          <section className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <h2 style={{ margin: '0 0 0.5rem' }}>Dirección de envío</h2>
            <p className="muted" style={{ margin: 0 }}>
              {order.shippingAddress.address}, {order.shippingAddress.city}{order.shippingAddress.department ? `, ${order.shippingAddress.department}` : ''}<br />
              {order.shippingAddress.phone && <>Tel: {order.shippingAddress.phone}</>}
            </p>
          </section>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/productos" className="btn secondary">Seguir comprando</Link>
          {user && <Link to="/dashboard/pedidos" className="btn secondary">Ver mis pedidos</Link>}
          {supportWaLink ? (
            <a href={supportWaLink} target="_blank" rel="noopener noreferrer" className="btn accent">
              ¿Dudas? Escribe a soporte
            </a>
          ) : (
            <a href={supportEmailLink} className="btn accent">
              ¿Dudas? Escríbenos a {SUPPORT_EMAIL}
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
