import { Link, useParams } from 'react-router-dom';
import Seo from '../lib/Seo';

const CONTENT = {
  envios: {
    title: 'Política de envíos',
    description: 'Tiempos, costos y cobertura de envíos en Manos Creadoras.',
    blocks: [
      ['Cobertura', 'Hacemos envíos a todo Colombia. Las principales transportadoras que usamos son Servientrega, Coordinadora e Inter Rapidísimo.'],
      ['Tiempos estimados', 'Bogotá, Medellín y Cali: 2 a 4 días hábiles. Resto del país: 3 a 7 días hábiles. Las zonas rurales o de difícil acceso pueden tardar hasta 10 días.'],
      ['Costos', 'El costo del envío depende de la ciudad de destino, el peso y el volumen. Lo verás en el detalle del pedido antes de confirmar.'],
      ['Empaque', 'Cada artesano empaca con materiales adecuados para proteger la pieza. Las piezas frágiles llevan protección adicional.'],
      ['Pago contra entrega', 'Disponible en la mayoría de ciudades capitales. Pagas al recibir el producto.'],
    ],
  },
  devoluciones: {
    title: 'Política de devoluciones',
    description: 'Reglas y plazos para devolver una pieza si no quedaste satisfecho.',
    blocks: [
      ['Garantía de 7 días', 'Tienes 7 días calendario desde la entrega para solicitar una devolución si la pieza llegó dañada o no corresponde a la descripción.'],
      ['Cómo solicitarla', 'Escríbenos por WhatsApp o correo con tu número de pedido y fotos del producto. Coordinamos la recogida o el envío de retorno.'],
      ['Reembolso', 'Una vez recibimos la pieza en buen estado, reembolsamos el valor pagado por el producto. El costo del envío inicial no es reembolsable, salvo error nuestro o del artesano.'],
      ['Productos personalizados', 'Las piezas hechas a la medida no tienen devolución salvo defecto de fábrica.'],
    ],
  },
  terminos: {
    title: 'Términos y condiciones',
    description: 'Reglas de uso de la plataforma Manos Creadoras.',
    blocks: [
      ['Aceptación', 'Al usar Manos Creadoras aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.'],
      ['Cuentas', 'Eres responsable de mantener la seguridad de tu contraseña. Las cuentas de artesano requieren verificación manual.'],
      ['Productos', 'Los artesanos son responsables de la veracidad de la información de sus productos. La plataforma facilita la conexión.'],
      ['Pagos', 'En esta etapa los pagos se gestionan por transferencia, pago contra entrega o coordinación vía WhatsApp.'],
      ['Limitación de responsabilidad', 'Manos Creadoras facilita la conexión entre artesanos y compradores. Cualquier disputa se mediará de buena fe entre las partes.'],
    ],
  },
  privacidad: {
    title: 'Política de privacidad',
    description: 'Cómo tratamos tus datos personales.',
    blocks: [
      ['Datos que recolectamos', 'Nombre, correo, dirección de envío, teléfono y datos de pedidos.'],
      ['Uso', 'Usamos tus datos para procesar pedidos, comunicarnos contigo y mejorar la plataforma. No vendemos datos a terceros.'],
      ['Cookies y analítica', 'Usamos GA4 y Meta Pixel para entender el uso del sitio y mejorar la experiencia.'],
      ['Tus derechos', 'Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a hola@manoscreadoras.com.'],
    ],
  },
};

export default function LegalPage() {
  const { slug } = useParams();
  const data = CONTENT[slug];

  if (!data) {
    return (
      <main className="page" role="main">
        <Seo title="Página no encontrada" noindex />
        <h1>Página no encontrada</h1>
        <Link to="/" className="btn accent">Volver al inicio</Link>
      </main>
    );
  }

  return (
    <main className="page" role="main">
      <Seo title={data.title} description={data.description} />
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 className="section-title">{data.title}</h1>
        <p className="section-subtitle">{data.description}</p>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          {data.blocks.map(([heading, body]) => (
            <section key={heading} className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem' }}>{heading}</h2>
              <p className="muted" style={{ margin: 0 }}>{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
