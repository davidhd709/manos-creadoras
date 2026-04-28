// Compresión client-side sin dependencias.
// Reduce a un máximo de `maxDim` px (lado más largo) y exporta a JPEG/WebP.

const DEFAULTS = { maxDim: 1600, quality: 0.82, mimeType: 'image/jpeg' };

export function compressImage(file, opts = {}) {
  const { maxDim, quality, mimeType } = { ...DEFAULTS, ...opts };
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('No se pudo comprimir la imagen'));
            const compressed = new File(
              [blob],
              file.name.replace(/\.\w+$/, '.jpg'),
              { type: mimeType, lastModified: Date.now() },
            );
            // Si el archivo "comprimido" pesa más que el original, devolvemos el original.
            resolve(compressed.size < file.size ? compressed : file);
          },
          mimeType,
          quality,
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
