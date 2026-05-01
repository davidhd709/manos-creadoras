// Soporte: lee número de WhatsApp y email desde variables de entorno.
// Si no hay número configurado, los CTA caen al email/contacto.

const RAW_WA = import.meta.env.VITE_SUPPORT_WHATSAPP;
const RAW_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;

function sanitizeWa(value) {
  if (!value || typeof value !== 'string') return '';
  const digits = value.replace(/[^0-9]/g, '');
  // Mínimo 8 dígitos para considerar válido (descarta placeholders muy cortos)
  return digits.length >= 8 ? digits : '';
}

export const SUPPORT_WHATSAPP = sanitizeWa(RAW_WA);
export const SUPPORT_EMAIL = (RAW_EMAIL && String(RAW_EMAIL).trim()) || 'hola@manoscreadoras.com';
export const HAS_SUPPORT_WHATSAPP = SUPPORT_WHATSAPP.length > 0;

export function buildSupportWaLink(message) {
  if (!HAS_SUPPORT_WHATSAPP) return null;
  const base = `https://wa.me/${SUPPORT_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildSupportEmailLink(subject, body) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${SUPPORT_EMAIL}${params.length ? `?${params.join('&')}` : ''}`;
}
