import Seo from '../lib/Seo';

const SUPPORT_WHATSAPP = import.meta.env.VITE_SUPPORT_WHATSAPP || '573001234567';

export default function ContactPage() {
  return (
    <main className="page" role="main">
      <Seo title="Contacto" description="Escribenos por WhatsApp o correo. Atencion en horario habil." />
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 className="section-title">Contacto</h1>
        <p className="section-subtitle">Estamos para ayudarte en horario habil de lunes a viernes.</p>

        <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div>
            <strong>WhatsApp</strong>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn accent"
              style={{ marginLeft: '0.75rem', padding: '0.45rem 0.85rem' }}
            >
              Escribir por WhatsApp
            </a>
          </div>
          <div>
            <strong>Correo</strong>
            <a href="mailto:hola@manoscreadoras.com" style={{ marginLeft: '0.75rem', color: 'var(--accent-dark)', fontWeight: 600 }}>
              hola@manoscreadoras.com
            </a>
          </div>
          <div className="muted" style={{ fontSize: '0.9rem' }}>
            Si tu mensaje es sobre un pedido, indicanos el numero de pedido para resolver mas rapido.
          </div>
        </div>
      </div>
    </main>
  );
}
