import { Link, useParams } from 'react-router-dom';
import Seo from '../lib/Seo';

const CONTENT = {
  envios: {
    title: 'Politica de envios',
    description: 'Tiempos, costos y cobertura de envios en Manos Creadoras.',
    blocks: [
      ['Cobertura', 'Hacemos envios a todo Colombia. Las principales transportadoras que usamos son Servientrega, Coordinadora e Inter Rapidisimo.'],
      ['Tiempos estimados', 'Bogota, Medellin, Cali: 2 a 4 dias habiles. Resto del pais: 3 a 7 dias habiles. Zonas rurales o de dificil acceso pueden tardar hasta 10 dias.'],
      ['Costos', 'El costo de envio depende de la ciudad de destino, el peso y el volumen. Lo veras en el detalle del pedido antes de confirmar.'],
      ['Empaque', 'Cada artesano empaca con materiales adecuados para proteger la pieza. Las piezas fragiles llevan proteccion adicional.'],
      ['Pago contra entrega', 'Disponible para la mayoria de ciudades capitales. Pagas al recibir el producto.'],
    ],
  },
  devoluciones: {
    title: 'Politica de devoluciones',
    description: 'Reglas y plazos para devolver una pieza si no quedaste satisfecho.',
    blocks: [
      ['Garantia 7 dias', 'Tienes 7 dias calendario desde la entrega para solicitar una devolucion si la pieza llego daniada o no corresponde a la descripcion.'],
      ['Como solicitarla', 'Escribenos por WhatsApp o correo con tu numero de pedido y fotos del producto. Coordinamos la recogida o envio de retorno.'],
      ['Reembolso', 'Una vez recibimos la pieza en buen estado, se reembolsa el valor pagado por el producto. El costo del envio inicial no es reembolsable salvo error nuestro o del artesano.'],
      ['Productos personalizados', 'Las piezas hechas a la medida no tienen devolucion salvo defecto de fabrica.'],
    ],
  },
  terminos: {
    title: 'Terminos y condiciones',
    description: 'Reglas de uso de la plataforma Manos Creadoras.',
    blocks: [
      ['Aceptacion', 'Al usar Manos Creadoras aceptas estos terminos. Si no estas de acuerdo, no uses la plataforma.'],
      ['Cuentas', 'Eres responsable de mantener la seguridad de tu contrasena. Las cuentas de artesano requieren verificacion manual.'],
      ['Productos', 'Los artesanos son responsables de la veracidad de la informacion de sus productos. La plataforma facilita la conexion.'],
      ['Pagos', 'En esta etapa los pagos se gestionan por transferencia, pago contra entrega o coordinacion via WhatsApp.'],
      ['Limitacion de responsabilidad', 'Manos Creadoras facilita la conexion entre artesanos y compradores. Cualquier disputa se mediara con buena fe entre las partes.'],
    ],
  },
  privacidad: {
    title: 'Politica de privacidad',
    description: 'Como tratamos tus datos personales.',
    blocks: [
      ['Datos que recolectamos', 'Nombre, correo, direccion de envio, telefono y datos de pedidos.'],
      ['Uso', 'Usamos tus datos para procesar pedidos, comunicarnos contigo y mejorar la plataforma. No vendemos datos a terceros.'],
      ['Cookies y analitica', 'Usamos GA4 y Meta Pixel para entender el uso del sitio y mejorar la experiencia.'],
      ['Tus derechos', 'Puedes solicitar acceso, correccion o eliminacion de tus datos escribiendo a hola@manoscreadoras.com.'],
    ],
  },
};

export default function LegalPage() {
  const { slug } = useParams();
  const data = CONTENT[slug];

  if (!data) {
    return (
      <main className="page" role="main">
        <Seo title="Pagina no encontrada" noindex />
        <h1>Pagina no encontrada</h1>
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
