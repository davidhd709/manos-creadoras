import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STEPS = [
  {
    key: 'profile',
    title: 'Completa tu perfil de artesano',
    desc: 'Cuenta tu historia, oficio y region. Los compradores compran 3x mas a artesanos con perfil completo.',
    cta: 'Completar perfil',
    href: '/dashboard/perfil-negocio',
  },
  {
    key: 'product',
    title: 'Publica tu primer producto',
    desc: 'Sube fotos, define precio y describe la pieza. Recomendado: minimo 5 productos.',
    cta: 'Crear producto',
    href: '/dashboard/productos',
  },
  {
    key: 'firstSale',
    title: 'Recibe tu primera venta',
    desc: 'Comparte tu vitrina en redes y prepara el empaque. Te avisamos por correo y WhatsApp cuando llegue un pedido.',
    cta: 'Ver pedidos',
    href: '/dashboard/pedidos',
  },
];

export default function OnboardingChecklist() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/artisan-profiles/me/onboarding')
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  if (!status) return null;
  if (status.completed) return null;

  const total = STEPS.length;
  const done = STEPS.filter((s) => status[s.key]).length;
  const pct = Math.round((done / total) * 100);

  return (
    <section className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--bg-warm), #fff)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Empieza a vender en 3 pasos</h3>
        <span className="muted" style={{ fontSize: '0.85rem' }}>{done}/{total} completado</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'var(--border-light)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent, #C2410C)', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ display: 'grid', gap: '0.6rem', marginTop: '1rem' }}>
        {STEPS.map((s) => {
          const isDone = !!status[s.key];
          return (
            <div
              key={s.key}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: '#fff',
                opacity: isDone ? 0.7 : 1,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isDone ? 'var(--success)' : 'var(--border-light)',
                  color: isDone ? '#fff' : 'var(--text-secondary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem',
                }}
              >
                {isDone ? '✓' : STEPS.indexOf(s) + 1}
              </span>
              <div>
                <strong style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{s.title}</strong>
                <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>{s.desc}</p>
              </div>
              {!isDone && (
                <Link to={s.href} className="btn accent" style={{ padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}>
                  {s.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
