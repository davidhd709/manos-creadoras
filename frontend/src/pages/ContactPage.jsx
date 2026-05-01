import Seo from '../lib/Seo';
import {
  HAS_SUPPORT_WHATSAPP,
  SUPPORT_EMAIL,
  buildSupportEmailLink,
  buildSupportWaLink,
} from '../lib/support';

export default function ContactPage() {
  const waLink = buildSupportWaLink();
  const emailLink = buildSupportEmailLink('Consulta desde el sitio');

  return (
    <main className="page" role="main">
      <Seo title="Contacto" description="Escríbenos por WhatsApp o correo. Atención en horario hábil." />
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 className="section-title">Contacto</h1>
        <p className="section-subtitle">Estamos para ayudarte en horario hábil de lunes a viernes.</p>

        <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
          {HAS_SUPPORT_WHATSAPP ? (
            <div>
              <strong>WhatsApp</strong>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn accent"
                style={{ marginLeft: '0.75rem', padding: '0.45rem 0.85rem' }}
              >
                Escribir por WhatsApp
              </a>
            </div>
          ) : (
            <div className="muted" style={{ fontSize: '0.9rem' }}>
              Pronto habilitaremos atención por WhatsApp. Por ahora, escríbenos por correo y te respondemos a la brevedad.
            </div>
          )}
          <div>
            <strong>Correo</strong>
            <a href={emailLink} style={{ marginLeft: '0.75rem', color: 'var(--accent-dark)', fontWeight: 600 }}>
              {SUPPORT_EMAIL}
            </a>
          </div>
          <div className="muted" style={{ fontSize: '0.9rem' }}>
            Si tu mensaje es sobre un pedido, indícanos el número de pedido para resolver más rápido.
          </div>
        </div>
      </div>
    </main>
  );
}
