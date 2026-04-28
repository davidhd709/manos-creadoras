import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import Seo from '../lib/Seo';
import { compressImage } from '../lib/compressImage';

const REGIONS = [
  'Antioquia', 'Atlantico', 'Bogota D.C.', 'Bolivar', 'Boyaca', 'Caldas', 'Caqueta', 'Cauca',
  'Cesar', 'Choco', 'Cordoba', 'Cundinamarca', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
  'Nariño', 'Norte de Santander', 'Putumayo', 'Quindio', 'Risaralda', 'Santander', 'Sucre',
  'Tolima', 'Valle del Cauca', 'Otra',
];

const CRAFTS = [
  'Ceramica', 'Tejido (mochilas, telar)', 'Joyeria y filigrana', 'Madera y tallado',
  'Cuero', 'Vidrio', 'Iraca y palma', 'Mopa-mopa', 'Pintura y arte', 'Otra',
];

const STEPS = [
  { id: 1, label: 'Tu negocio', icon: '🏷️' },
  { id: 2, label: 'Tu historia', icon: '📖' },
  { id: 3, label: 'Contacto y pago', icon: '📞' },
];

const initialForm = {
  businessName: '',
  logo: '',
  coverImage: '',
  description: '',
  story: '',
  craft: '',
  region: '',
  phone: '',
  city: '',
  department: '',
  website: '',
  nit: '',
  bankAccount: '',
  bankName: '',
  socialMedia: { facebook: '', instagram: '', whatsapp: '' },
};

export default function ArtisanProfilePage() {
  useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/artisan-profiles/me')
      .then(({ data }) => {
        if (data) {
          setForm({
            ...initialForm,
            ...data,
            socialMedia: { ...initialForm.socialMedia, ...(data.socialMedia || {}) },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const updateSocial = (k) => (e) => setForm({ ...form, socialMedia: { ...form.socialMedia, [k]: e.target.value } });

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, { maxDim: 1600 });
      const fd = new FormData();
      fd.append('files', compressed);
      const { data } = await api.post('/upload/images', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ ...form, coverImage: data.urls?.[0] || '' });
    } catch (err) {
      toast.error('No se pudo subir la imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async () => {
    setSubmitting(true);
    try {
      await api.put('/artisan-profiles/me', form);
      toast.success('Perfil actualizado');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const next = async () => {
    if (step === 1 && !form.businessName) {
      return toast.error('Cuentanos el nombre de tu negocio');
    }
    if (step === 2 && (!form.craft || !form.region)) {
      return toast.error('Elige tu oficio y region');
    }
    const ok = await save();
    if (ok && step < STEPS.length) setStep(step + 1);
  };

  if (loading) return <Spinner />;

  return (
    <main className="page" role="main">
      <Seo title="Perfil de artesano" description="Configura tu vitrina de artesano." noindex />
      <nav style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
        {' / '}<span style={{ color: 'var(--text)' }}>Perfil de artesano</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Configura tu vitrina</h1>
          <p className="section-subtitle">Tres pasos rapidos. Tus compradores veran esta informacion en tu perfil publico.</p>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
        {STEPS.map((s) => {
          const active = s.id === step;
          const done = s.id < step;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setStep(s.id)}
              className="card"
              style={{
                flex: '1 1 220px',
                padding: '0.85rem 1rem',
                border: `1px solid ${active ? 'var(--accent, #C2410C)' : 'var(--border)'}`,
                background: active ? 'var(--bg-warm)' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                opacity: done ? 0.85 : 1,
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Paso {s.id}</div>
              <strong>{s.icon} {s.label}</strong>
            </button>
          );
        })}
      </div>

      {/* Paso 1 */}
      {step === 1 && (
        <section className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Tu negocio</h2>
          <label>
            Nombre del negocio o taller *
            <input value={form.businessName} onChange={update('businessName')} required placeholder="Ej: Tejidos Sandona" />
          </label>
          <label>
            Frase corta (opcional)
            <input value={form.description} onChange={update('description')} maxLength={140} placeholder="Una frase que describa tu negocio" />
          </label>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              URL de logo (opcional)
              <input value={form.logo} onChange={update('logo')} placeholder="https://..." />
            </label>
            <label>
              Sitio web (opcional)
              <input value={form.website} onChange={update('website')} placeholder="https://..." />
            </label>
          </div>
          <div>
            <label>Foto del taller (portada)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
              {form.coverImage && (
                <img src={form.coverImage} alt="Portada" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              )}
              <label className="btn secondary" style={{ cursor: 'pointer' }}>
                {uploading ? 'Subiendo...' : (form.coverImage ? 'Cambiar foto' : 'Subir foto')}
                <input type="file" accept="image/*" onChange={uploadCover} style={{ display: 'none' }} />
              </label>
            </div>
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.4rem' }}>
              Tip: una foto del taller o del proceso da mas confianza que un producto solo.
            </p>
          </div>
        </section>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <section className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Tu historia</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              Oficio principal *
              <select value={form.craft} onChange={update('craft')} required>
                <option value="">Selecciona...</option>
                {CRAFTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Region / departamento *
              <select value={form.region} onChange={update('region')} required>
                <option value="">Selecciona...</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <label>
            Tu historia
            <textarea
              value={form.story}
              onChange={update('story')}
              rows={6}
              placeholder="¿Como aprendiste? ¿Que te diferencia? ¿De donde vienen tus piezas? Cuenta lo que enamora a tus compradores."
            />
            <span className="muted" style={{ fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>
              Las historias humanas convierten 3x mas. Habla en primera persona.
            </span>
          </label>
        </section>
      )}

      {/* Paso 3 */}
      {step === 3 && (
        <section className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Contacto y datos de pago</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              Telefono / WhatsApp
              <input value={form.phone} onChange={update('phone')} placeholder="3001234567" inputMode="tel" />
            </label>
            <label>
              Ciudad
              <input value={form.city} onChange={update('city')} />
            </label>
            <label>
              Departamento
              <input value={form.department} onChange={update('department')} />
            </label>
            <label>
              NIT / Registro (opcional)
              <input value={form.nit} onChange={update('nit')} />
            </label>
          </div>
          <h3 style={{ margin: '0.5rem 0 0', fontSize: '0.95rem' }}>Datos bancarios para que te paguen</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              Banco
              <input value={form.bankName} onChange={update('bankName')} placeholder="Bancolombia, Nequi, Daviplata..." />
            </label>
            <label>
              Numero de cuenta o telefono
              <input value={form.bankAccount} onChange={update('bankAccount')} />
            </label>
          </div>
          <h3 style={{ margin: '0.5rem 0 0', fontSize: '0.95rem' }}>Redes sociales (opcional)</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              Instagram
              <input value={form.socialMedia.instagram} onChange={updateSocial('instagram')} placeholder="@tutaller" />
            </label>
            <label>
              Facebook
              <input value={form.socialMedia.facebook} onChange={updateSocial('facebook')} />
            </label>
            <label>
              WhatsApp publico
              <input value={form.socialMedia.whatsapp} onChange={updateSocial('whatsapp')} placeholder="3001234567" inputMode="tel" />
            </label>
          </div>
        </section>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn secondary"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Anterior
        </button>
        {step < STEPS.length ? (
          <button type="button" className="btn accent" onClick={next} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        ) : (
          <button type="button" className="btn accent" onClick={save} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar perfil'}
          </button>
        )}
      </div>
    </main>
  );
}
