import { Link } from 'react-router-dom';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';

const HOW_STEPS = [
  {
    n: '01',
    title: 'Te registras y revisamos en menos de 24 horas',
    desc: 'Completas un formulario corto con tu oficio, región y un par de datos. Te avisamos por correo y WhatsApp cuando tu cuenta esté aprobada.',
  },
  {
    n: '02',
    title: 'Subes tus productos con guía paso a paso',
    desc: 'Foto, precio, descripción. Te ayudamos con plantillas y consejos para que tus piezas se vean bien y vendan.',
  },
  {
    n: '03',
    title: 'Recibes pedidos por WhatsApp y correo',
    desc: 'Cada pedido te llega con datos del comprador y dirección de envío. Tú coordinas el despacho.',
  },
  {
    n: '04',
    title: 'Cobras como prefieras',
    desc: 'Transferencia (Bancolombia, Nequi, Daviplata), pago contra entrega o coordinación por WhatsApp. Sin pasarela obligatoria.',
  },
];

const BENEFITS = [
  {
    icon: '🎁',
    title: '0% comisión los primeros 3 meses',
    desc: 'Empieza a vender sin costo. Después, la comisión es transparente y solo se aplica a ventas confirmadas.',
  },
  {
    icon: '🪪',
    title: 'Vitrina propia que puedes compartir',
    desc: 'Tu perfil tiene una URL única con tu historia, tus piezas y tus reseñas. Compártela en tus redes.',
  },
  {
    icon: '🚚',
    title: 'Compradores en todo Colombia',
    desc: 'Llegamos a Bogotá, Medellín, Cali, Cartagena y más. Tú solo te enfocas en crear.',
  },
  {
    icon: '🛡️',
    title: 'Verificación que genera confianza',
    desc: 'Los compradores ven el sello "Artesano verificado" y compran con más seguridad.',
  },
  {
    icon: '📸',
    title: 'Te acompañamos con fotografía y descripción',
    desc: 'Plantillas y tips para que tus productos se vean profesionales sin estudio fotográfico.',
  },
  {
    icon: '💬',
    title: 'Soporte directo por WhatsApp',
    desc: 'Resolvemos dudas en horario hábil. Sin tickets ni esperas eternas.',
  },
];

const COMMISSION_TIERS = [
  { period: 'Mes 1', rate: '0%', note: 'Te damos espacio para arrancar.' },
  { period: 'Mes 2', rate: '0%', note: 'Sigue probando sin costos.' },
  { period: 'Mes 3', rate: '0%', note: 'Cierra tu primera trimestre completa.' },
  { period: 'Desde el mes 4', rate: '8%', note: 'Solo sobre ventas confirmadas. Sin cuotas mensuales.' },
];

const SUCCESS_STORIES = [
  {
    name: 'María Fernanda',
    craft: 'Mochilas Wayuu',
    region: 'La Guajira',
    quote:
      'Antes vendía solo a turistas que llegaban a Riohacha. Hoy mando piezas a Bogotá y Medellín cada semana, sin pagar comisión.',
    metric: '+12 ventas/mes',
  },
  {
    name: 'Don Carlos',
    craft: 'Cerámica',
    region: 'Ráquira, Boyacá',
    quote:
      'El acompañamiento con las fotos cambió todo. Mi taller pasó de tener 4 piezas listadas a 23 en dos semanas.',
    metric: 'Vitrina con 23 piezas',
  },
  {
    name: 'Luisa',
    craft: 'Joyería en filigrana',
    region: 'Mompox, Bolívar',
    quote:
      'Lo que más me gusta es coordinar pedidos por WhatsApp. Yo no quería pelear con pasarelas, y aquí no hace falta.',
    metric: 'Pedidos directos por WA',
  },
];

const FAQ = [
  {
    q: '¿Cuánto cuesta vender en Manos Creadoras?',
    a: 'Durante los primeros 3 meses la comisión es 0%. Después, cobramos un porcentaje sobre las ventas confirmadas. No hay cuotas mensuales ni cobros por publicación.',
  },
  {
    q: '¿Necesito tener empresa o RUT?',
    a: 'No es obligatorio para empezar. Puedes vender como persona natural. Si superas cierto volumen te ayudamos con el siguiente paso.',
  },
  {
    q: '¿Cómo me pagan los compradores?',
    a: 'Por ahora soportamos transferencia bancaria (Bancolombia, Nequi, Daviplata), pago contra entrega y coordinación por WhatsApp. Pronto integraremos pasarela con tarjeta y PSE.',
  },
  {
    q: '¿Quién envía los productos?',
    a: 'Tú como artesano. Te ayudamos con recomendaciones de transportadoras (Servientrega, Coordinadora, Inter Rapidísimo) y plantillas de empaque.',
  },
  {
    q: '¿Cuántas piezas debo tener para empezar?',
    a: 'Recomendamos mínimo 5 productos con buenas fotos. Mientras más variedad, más oportunidades de venta.',
  },
  {
    q: '¿Y si me arrepiento o no vendo nada?',
    a: 'No pasa nada. No hay penalidades, no hay cláusulas de permanencia. Pausas tu vitrina o cierras la cuenta cuando quieras.',
  },
];

export default function SellPage() {
  return (
    <main role="main">
      <Seo
        title="Vende tus artesanías en Manos Creadoras"
        description="0% comisión los primeros 3 meses. Vende mochilas wayuu, cerámica, joyería y más a clientes en todo Colombia. Sin pasarela obligatoria, recibe pedidos por WhatsApp."
      />
      <section className="hero-full" aria-label="Vende en Manos Creadoras">
        <div className="hero-bg-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-1" aria-hidden="true" />
        <div className="hero-glow hero-glow-2" aria-hidden="true" />

        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-tag">
              <span className="hero-tag-dot" />
              Para artesanos colombianos
            </span>

            <h1 className="hero-title">
              Vende tus piezas a<br />
              clientes <em>de todo el país</em>
            </h1>

            <p className="hero-desc">
              Manos Creadoras es el marketplace donde el artesano cobra justo y el comprador
              compra directo del taller. <strong>0% de comisión los primeros 3 meses.</strong>
            </p>

            <div className="hero-actions">
              <Link
                className="hero-cta"
                to="/registro/artesano"
                onClick={() => track('cta_sell_clicked', { placement: 'hero_sell' })}
              >
                Crear mi cuenta gratis
              </Link>
              <a className="hero-cta-ghost" href="#como-funciona">
                Cómo funciona
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">0%</span>
                <span className="hero-stat-label">Comisión 3 meses</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">24h</span>
                <span className="hero-stat-label">Aprobación</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">CO</span>
                <span className="hero-stat-label">Cobertura nacional</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page" style={{ paddingTop: '2rem' }}>
        <section className="section" aria-label="Beneficios">
          <div className="section-header">
            <div>
              <h2 className="section-title">Por qué vender en Manos Creadoras</h2>
              <p className="section-subtitle">Construido para artesanos reales, no para gigantes del e-commerce.</p>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {BENEFITS.map((b) => (
              <div key={b.title} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{b.icon}</div>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem' }}>{b.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.92rem' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" aria-label="Estructura de comisiones">
          <div className="section-header">
            <div>
              <h2 className="section-title">Comisiones transparentes</h2>
              <p className="section-subtitle">Sin sorpresas. Pagas solo cuando vendes.</p>
            </div>
          </div>
          <div className="commission-grid">
            {COMMISSION_TIERS.map((t) => (
              <div key={t.period} className={`commission-tier ${t.rate === '0%' ? 'tier-free' : 'tier-paid'}`}>
                <span className="commission-period">{t.period}</span>
                <span className="commission-rate">{t.rate}</span>
                <span className="commission-note">{t.note}</span>
              </div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem', textAlign: 'center' }}>
            La comisión solo se aplica sobre ventas confirmadas y entregadas. No cobramos por listar productos ni por mantener tu vitrina abierta.
          </p>
        </section>

        <section id="como-funciona" className="section" aria-label="Cómo funciona">
          <div className="section-header">
            <div>
              <h2 className="section-title">Cómo funciona</h2>
              <p className="section-subtitle">Cuatro pasos para empezar a vender.</p>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {HOW_STEPS.map((s) => (
              <div key={s.n} className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--accent-dark)' }}>{s.n}</span>
                <h3 style={{ margin: '0.4rem 0 0.4rem', fontSize: '1.05rem' }}>{s.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.92rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" aria-label="Casos de éxito">
          <div className="section-header">
            <div>
              <h2 className="section-title">Lo que dicen los artesanos</h2>
              <p className="section-subtitle">Talleres que ya están vendiendo en todo el país.</p>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {SUCCESS_STORIES.map((s) => (
              <article key={s.name} className="success-card">
                <div className="success-card-header">
                  <span className="success-avatar" aria-hidden="true">{s.name.charAt(0)}</span>
                  <div>
                    <strong>{s.name}</strong>
                    <span className="muted" style={{ fontSize: '0.82rem', display: 'block' }}>
                      {s.craft} · {s.region}
                    </span>
                  </div>
                </div>
                <p className="success-quote">{s.quote}</p>
                <span className="success-metric">{s.metric}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section" aria-label="Preguntas frecuentes">
          <div className="section-header">
            <div>
              <h2 className="section-title">Preguntas frecuentes</h2>
              <p className="section-subtitle">Lo que más nos preguntan los artesanos.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {FAQ.map((f) => (
              <details key={f.q} className="card" style={{ padding: '1rem 1.25rem' }}>
                <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{f.q}</summary>
                <p className="muted" style={{ margin: '0.5rem 0 0', fontSize: '0.92rem' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section" aria-label="Llamado a la acción final">
          <div className="card sell-final-cta">
            <h2 style={{ margin: '0 0 0.5rem' }}>Empieza a vender en menos de 10 minutos</h2>
            <p className="muted" style={{ margin: '0 0 1.25rem' }}>
              Sin cuotas mensuales. Sin pasarela obligatoria. Solo crea tu cuenta y comparte tus piezas.
            </p>
            <Link
              className="btn accent"
              to="/registro/artesano"
              style={{ padding: '0.85rem 2rem' }}
              onClick={() => track('cta_sell_clicked', { placement: 'footer_sell' })}
            >
              Crear mi cuenta gratis
            </Link>
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.75rem' }}>
              ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Inicia sesión</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
