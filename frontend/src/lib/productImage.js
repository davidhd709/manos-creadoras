// SVG inline en data URL para evitar dependencia de un placeholder externo
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <g fill="#9ca3af" font-family="system-ui, sans-serif" text-anchor="middle">
        <text x="200" y="155" font-size="48">🪵</text>
        <text x="200" y="195" font-size="14">Imagen no disponible</text>
      </g>
    </svg>`,
  );

export function getProductImage(product, index = 0) {
  const url = product?.images?.[index];
  return url && typeof url === 'string' && url.trim() ? url : PLACEHOLDER_IMG;
}

export function handleImgError(e) {
  if (e?.currentTarget && e.currentTarget.src !== PLACEHOLDER_IMG) {
    e.currentTarget.src = PLACEHOLDER_IMG;
  }
}
