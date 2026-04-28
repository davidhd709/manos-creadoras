import Seo from '../lib/Seo';

const FAQ = [
  { q: '¿Como hago un pedido?', a: 'Agregas productos al carrito, eliges metodo de pago (WhatsApp, transferencia o contraentrega) y confirmas. El artesano recibe tu pedido y coordina el envio contigo.' },
  { q: '¿Cuales son los metodos de pago?', a: 'Por ahora soportamos transferencia (Bancolombia, Nequi, Daviplata), pago contra entrega y coordinacion por WhatsApp. Pronto integraremos tarjeta y PSE.' },
  { q: '¿Cuanto demora el envio?', a: 'Entre 2 y 7 dias habiles segun la ciudad. Tu artesano te confirma el tiempo exacto al despachar.' },
  { q: '¿Puedo devolver un producto?', a: 'Si, tienes 7 dias desde la entrega para devolver una pieza si llego daniada o no corresponde. Revisa nuestra politica de devoluciones.' },
  { q: '¿Como me convierto en artesano vendedor?', a: 'Visita la pagina /vende y completa el formulario. Aprobamos en menos de 24 horas.' },
  { q: '¿Tienen tienda fisica?', a: 'No por ahora. Manos Creadoras es 100% online y los productos viajan directo del taller a tu casa.' },
];

export default function FaqPage() {
  return (
    <main className="page" role="main">
      <Seo title="Preguntas frecuentes" description="Respuestas a las dudas mas comunes sobre Manos Creadoras." />
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 className="section-title">Preguntas frecuentes</h1>
        <p className="section-subtitle">Si no encuentras tu respuesta, escribenos por WhatsApp o correo.</p>
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
