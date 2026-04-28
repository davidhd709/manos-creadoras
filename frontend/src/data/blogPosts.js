// Artículos seed del blog. Mantenidos como datos para no añadir backend en MVP.
// Cuando crezca el contenido, esto se moverá a un módulo `content` en NestJS o a un CMS headless.

export const BLOG_POSTS = [
  {
    slug: 'mochila-wayuu-historia-y-significado',
    title: 'La mochila wayuu: historia, simbolos y como elegir una autentica',
    excerpt: 'Aprende a diferenciar una mochila wayuu hecha a mano por una artesana de La Guajira de las imitaciones industriales. Te contamos su historia, los simbolos tejidos y como cuidarla.',
    category: 'Tejidos',
    region: 'La Guajira',
    publishedAt: '2026-04-10',
    readingMinutes: 6,
    cover: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=80',
    body: `
La mochila wayuu nace de la tradicion del pueblo Wayuu en La Guajira y norte de Venezuela. Cada pieza puede tomar entre 15 y 25 dias de trabajo a una sola artesana, que teje con tecnica de un solo hilo.

## Como diferenciar una mochila autentica

- **Tejido en una sola pieza:** la base y el cuerpo se tejen juntos, sin costuras visibles.
- **Patrones (kanas):** cada simbolo tiene un significado heredado por linea materna.
- **Hilo de algodon de calidad:** las imitaciones suelen usar acrilico que pierde forma rapido.

## Como cuidarla

Lava a mano con jabon neutro, no la exprimas y secala a la sombra. Bien cuidada, una wayuu te dura decadas.

## En Manos Creadoras

Trabajamos con cooperativas de artesanas en Manaure y Uribia. Cada mochila viene con la firma de quien la tejio.
`,
  },
  {
    slug: 'ceramica-de-raquira-cuidados-y-piezas',
    title: 'Ceramica de Raquira: como cuidarla para que dure decadas',
    excerpt: 'Raquira es la cuna de la ceramica colombiana. Te explicamos como reconocer una buena pieza, como limpiarla y por que apoyar a estos artesanos boyacenses cambia vidas.',
    category: 'Ceramica',
    region: 'Boyaca',
    publishedAt: '2026-04-04',
    readingMinutes: 5,
    cover: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
    body: `
En Raquira, Boyaca, las familias llevan generaciones moldeando arcilla. Cada pieza pasa por tornado, secado al sol, quemado en horno de leña y, en muchos casos, pintura a mano.

## Tipos de pieza mas comunes

- **Materas y vasijas:** ideales para plantas o decoracion.
- **Vajilla en barro rustico:** apta para horno y microondas.
- **Figuras decorativas:** los caballitos y gallos son emblema de la region.

## Cuidados

Antes del primer uso, sumergela en agua tibia 30 min para sellar los poros. Limpiala a mano. Evita choques termicos extremos.

## Por que importa

Cuando compras directo del taller, el dinero llega completo a la familia, sin intermediarios.
`,
  },
  {
    slug: 'filigrana-de-mompox-joyeria-patrimonial',
    title: 'Filigrana de Mompox: la joyeria que tejen con hilos de plata',
    excerpt: 'La filigrana mompoxina es patrimonio cultural de Colombia. Conoce la tecnica, los maestros joyeros y por que cada pieza es unica e irrepetible.',
    category: 'Joyeria',
    region: 'Bolivar',
    publishedAt: '2026-03-28',
    readingMinutes: 7,
    cover: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    body: `
La filigrana es el arte de tejer hilos de plata u oro hasta crear figuras delicadas. En Mompox (Bolivar), esta tecnica llego con los españoles en el siglo XVI y los joyeros locales la perfeccionaron por mas de 400 años.

## Que la hace especial

- **Hilos de plata 970:** mas pura que la plata 925 estandar.
- **Hecho 100% a mano:** no hay molde, cada pieza es unica.
- **Tradicion familiar:** los maestros aprenden desde niños.

## Como reconocer una pieza autentica

Pidele al joyero el sello de pureza y la firma o marca del taller. Si tiene certificado de origen Mompox, mejor.

## Inspiracion para regalo

Una pieza de filigrana es un regalo que no pasa de moda y que se hereda.
`,
  },
  {
    slug: '5-razones-comprar-artesania-colombiana',
    title: '5 razones para comprar artesania colombiana directo del taller',
    excerpt: 'Cuando eliges una pieza hecha a mano por un artesano colombiano, no solo decoras tu casa: apoyas tradiciones, cooperativas y comunidades enteras.',
    category: 'Inspiracion',
    region: 'Colombia',
    publishedAt: '2026-03-21',
    readingMinutes: 4,
    cover: 'https://images.unsplash.com/photo-1582034986517-30d6cc7d4d8b?auto=format&fit=crop&w=1200&q=80',
    body: `
Comprar artesania no es solo decorar bonito: es un acto cultural y economico. Aqui van 5 razones.

1. **Cada pieza es unica.** No hay dos iguales.
2. **El dinero queda en la comunidad.** Compra directo significa pago justo.
3. **Apoyas saberes ancestrales.** Cada tecnica que muere es un pedazo de identidad que se pierde.
4. **Sostenibilidad real.** Materiales naturales, procesos lentos, durabilidad larga.
5. **Tienes una historia que contar.** Cuando alguien admire la pieza en tu casa, podras contar quien la hizo.

## Como empezar

En Manos Creadoras puedes filtrar por region u oficio y conocer al artesano antes de comprar. Cada vitrina tiene su historia.
`,
  },
];

export function findPost(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}
