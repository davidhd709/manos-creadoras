import { useRef, useState } from 'react';
import api from '../api';
import { useToast } from '../ui/Toast';
import { compressImage } from '../lib/compressImage';

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default function ImageUpload({ value = [], onChange, max = 5, label = 'Imagenes del producto' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`Maximo ${max} imagenes`);
      return;
    }

    setUploading(true);
    try {
      const compressed = await Promise.all(Array.from(files).map((f) => compressImage(f)));
      const formData = new FormData();
      compressed.forEach((f) => formData.append('files', f));

      const { data } = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...value, ...data.urls]);
      toast.success(`${data.urls.length} imagen(es) subida(s)`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al subir imagenes';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{label}</legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {value.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
            <img
              src={url}
              alt={`Imagen ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              aria-label={`Eliminar imagen ${i + 1}`}
              style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--error)', color: '#fff', border: 'none',
                width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        id="image-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
        aria-label="Seleccionar archivos de imagen"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || value.length >= max}
        className="btn secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
      >
        <UploadIcon />
        {uploading ? 'Subiendo...' : value.length >= max ? `Maximo ${max} imagenes` : 'Subir imagenes'}
      </button>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        JPG, PNG, WEBP o GIF. Maximo 5MB por archivo, hasta {max} imagenes.
      </p>
    </fieldset>
  );
}
