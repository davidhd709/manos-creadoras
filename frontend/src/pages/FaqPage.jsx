import Seo from '../lib/Seo';

const FAQ = [
  {
    q: '¿Cómo hago un pedido?',
    a: 'Agregas productos al carrito, indicas cómo prefieres que te contactemos y confirmas el pedido en la plataforma. Después, el equipo de soporte o el vendedor se comunica contigo para acordar el pago y los detalles de entrega.',
  },
  {
    q: '¿Cómo se realiza el pago?',
    a: 'Por ahora, los pedidos se confirman en la plataforma y el pago se coordina directamente con el equipo de soporte o el vendedor. Te contactaremos para acordar el método de pago disponible y confirmar los detalles de entrega.',
  },
  {
    q: '¿El pago se cobra automáticamente al confirmar el pedido?',
    a: 'No. Confirmar el pedido solo lo registra en la plataforma. No realizamos ningún cobro en ese momento: el pago se coordina contigo después, una vez que el equipo o el vendedor se ponga en contacto.',
  },
  {
    q: '¿Cuánto demora el envío?',
    a: 'Entre 2 y 7 días hábiles según la ciudad. El artesano te confirma el tiempo exacto al despachar.',
  },
  {
    q: '¿Puedo devolver un producto?',
    a: 'Sí, tienes 7 días desde la entrega para devolver una pieza si llegó dañada o no corresponde. Revisa nuestra política de devoluciones.',
  },
  {
    q: '¿Cómo me convierto en artesano vendedor?',
    a: 'Visita la página /vende y completa el formulario. Aprobamos en menos de 24 horas.',
  },
  {
    q: '¿Tienen tienda física?',
    a: 'No por ahora. Manos Creadoras es 100% online y los productos viajan directo del taller a tu casa.',
  },
];

export default function FaqPage() {
  return (
    <main className="page" role="main">
      <Seo title="Preguntas frecuentes" description="Respuestas a las dudas más comunes sobre Manos Creadoras." />
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 className="section-title">Preguntas frecuentes</h1>
        <p className="section-subtitle">Si no encuentras tu respuesta, escríbenos por WhatsApp o correo.</p>
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
          {FAQ.map((f) => (
            <details key={f.q} className="card" style={{ padding: '1rem 1.25rem' }}>
              <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{f.q}</summary>
              <p className="muted" style={{ margin: '0.5rem 0 0' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
