// Catálogo de categorías: slug interno (para URL/filtros) ↔ label visible al usuario.
// Mantén siempre el slug en la BD y URL; usa categoryLabel(slug) para renderizar.

export const CATEGORIES = [
  { slug: 'ceramica', label: 'Cerámica', icon: '🏺' },
  { slug: 'tejidos', label: 'Tejidos', icon: '🧶' },
  { slug: 'joyeria', label: 'Joyería', icon: '💍' },
  { slug: 'madera', label: 'Madera', icon: '🪵' },
  { slug: 'pintura', label: 'Pintura', icon: '🎨' },
  { slug: 'cuero', label: 'Cuero', icon: '👜' },
  { slug: 'vidrio', label: 'Vidrio', icon: '🫙' },
  { slug: 'metal', label: 'Metal', icon: '⚒️' },
  { slug: 'otro', label: 'Otro', icon: '✨' },
];

const LABEL_BY_SLUG = CATEGORIES.reduce((acc, c) => {
  acc[c.slug] = c.label;
  return acc;
}, {});

export function categoryLabel(slug) {
  if (!slug) return '';
  const key = String(slug).toLowerCase().trim();
  if (LABEL_BY_SLUG[key]) return LABEL_BY_SLUG[key];
  // Fallback: capitaliza el slug en lugar de mostrarlo crudo.
  return key.charAt(0).toUpperCase() + key.slice(1);
}
