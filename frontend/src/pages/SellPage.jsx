import { Link } from 'react-router-dom';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';

const HOW_STEPS = [
  { n: '01', title: 'Te registras y revisamos en menos de 24 horas', desc: 'Completas un formulario corto con tu oficio, region y un par de datos. Te avisamos por correo y WhatsApp cuando tu cuenta este aprobada.' },
  { n: '02', title: 'Subes tus productos con guia paso a paso', desc: 'Foto, precio, descripcion. Te ayudamos con plantillas y consejos para que tus piezas se vean bien y vendan.' },
  { n: '03', title: 'Recibes pedidos por WhatsApp y correo', desc: 'Cada pedido te llega con datos del comprador y direccion de envio. Tu coordinas el despacho.' },
  { n: '04', title: 'Cobras como prefieras', desc: 'Transferencia (Bancolombia, Nequi, Daviplata), pago contra entrega o coordinacion por WhatsApp. Sin pasarela obligatoria.' },
];

const BENEFITS = [
  { icon: '🎁', title: '0% comision los primeros 3 meses', desc: 'Empieza a vender sin costo. Despues, la comision es transparente y solo se aplica a ventas confirmadas.' },
  { icon: '🪪', title: 'Vitrina propia que puedes compartir', desc: 'Tu perfil tiene una URL unica con tu historia, tus piezas y tus reseñas. Compartela en tus redes.' },
  { icon: '🚚', title: 'Te conectamos con compradores en todo Colombia', desc: 'Llegamos a Bogota, Medellin, Cali, Cartagena y mas. Tu solo te enfocas en crear.' },
  { icon: '🛡️', title: 'Verificacion que genera confianza', desc: 'Los compradores ven el sello "Artesano verificado" y compran con mas confianza.' },
  { icon: '📸', title: 'Te acompañamos en fotografia y descripcion', desc: 'Plantillas y tips para que tus productos se vean profesionales sin estudio fotografico.' },
  { icon: '💬', title: 'Soporte directo por WhatsApp', desc: 'Resolvemos dudas en horario habil. Sin tickets ni esperas eternas.' },
];

const FAQ = [
  { q: '¿Cuanto cuesta vender en Manos Creadoras?', a: 'Durante los primeros 3 meses la comision es 0%. Despues, cobramos un porcentaje sobre las ventas confirmadas. No hay cuotas mensuales ni cobros por publicacion.' },
  { q: '¿Necesito tener empresa o RUT?', a: 'No es obligatorio para empezar. Puedes vender como persona natural. Si superas cierto volumen te ayudamos con el siguiente paso.' },
  { q: '¿Como me pagan los compradores?', a: 'Por ahora soportamos transferencia bancaria (Bancolombia, Nequi, Daviplata), pago contra entrega y coordinacion por WhatsApp. Pronto integraremos pasarela con tarjeta y PSE.' },
  { q: '¿Quien envia los productos?', a: 'Tu como artesano. Te ayudamos con recomendaciones de transportadoras (Servientrega, Coordinadora, Inter Rapidisimo) y plantillas de empaque.' },
  { q: '¿Cuantas piezas debo tener para empezar?', a: 'Recomendamos minimo 5 productos con buenas fotos. Mientras mas variedad, mas oportunidades de venta.' },
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
              clientes <em>de todo el pais</em>
            </h1>

            <p className="hero-desc">
              Manos Creadoras es el marketplace donde el artesano cobra justo y el comprador
              compra directo del taller. <strong>0% de comision los primeros 3 meses.</strong>
            </p>

            <div className="hero-actions">
              <Link
                className="hero-cta"
                to="/registro/artesano"
                onClick={() => track('cta_sell_clicked', { placement: 'hero_sell' })}
              >
                Crear mi cuenta gratis
              </Link>
              <a
                className="hero-cta-ghost"
                href="#como-funciona"
              >
                Como funciona
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">0%</span>
                <span className="hero-stat-label">Comision 3 meses</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">24h</span>
                <span className="hero-stat-label">Aprobacion</span>
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
              <h2 className="section-title">Por que vender en Manos Creadoras</h2>
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

        <section id="como-funciona" className="section" aria-label="Como funciona">
          <div className="section-header">
            <div>
              <h2 className="section-title">Como funciona</h2>
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

        <section className="section" aria-label="Preguntas frecuentes">
          <div className="section-header">
            <div>
              <h2 className="section-title">Preguntas frecuentes</h2>
              <p className="section-subtitle">Lo que mas nos preguntan los artesanos.</p>
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

        <section className="section" aria-label="Llamado a la accion final">
          <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-light), var(--bg-warm))' }}>
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
          </div>
        </section>
      </div>
    </main>
  );
}
