const TESTIMONIALS = [
  {
    name: 'Laura M.',
    city: 'Bogota',
    quote: 'Compre una mochila wayuu directo del taller. Llego perfecta y la artesana me escribio para confirmar el envio. Recomendado.',
    rating: 5,
  },
  {
    name: 'Andres R.',
    city: 'Medellin',
    quote: 'Pedi una pieza de ceramica de Raquira por contraentrega. Pague al recibir. Calidad impecable y empaque cuidado.',
    rating: 5,
  },
  {
    name: 'Camila T.',
    city: 'Cali',
    quote: 'Me encanta saber quien hizo la pieza que llega a mi casa. La filigrana de Mompox es una belleza y vino con tarjeta firmada.',
    rating: 5,
  },
];

const Star = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

export default function Testimonials() {
  return (
    <section className="section" aria-label="Lo que dicen nuestros compradores">
      <div className="section-header">
        <div>
          <h2 className="section-title">Lo que dicen nuestros compradores</h2>
          <p className="section-subtitle">Testimonios reales de la beta abierta.</p>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="card" style={{ padding: '1.25rem', margin: 0 }}>
            <div style={{ display: 'flex', gap: '2px', color: 'var(--accent-dark)', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} filled={i <= t.rating} />
              ))}
            </div>
            <blockquote style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
              "{t.quote}"
            </blockquote>
            <figcaption className="muted" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              — <strong style={{ color: 'var(--text)' }}>{t.name}</strong>, {t.city}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
