import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';
import { useToast } from '../ui/Toast';

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

export default function ArtisanRegisterPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    craft: '',
    region: '',
    whatsapp: '',
    instagram: '',
    applicationNotes: '',
  });

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    track('sign_up_started', { role: 'artisan' });
    try {
      await api.post('/auth/register-artisan', form);
      track('sign_up_completed', { role: 'artisan' });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo enviar la solicitud';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="page" role="main">
        <Seo title="Solicitud recibida" noindex />
        <div className="card" style={{ padding: '2rem', maxWidth: 560, margin: '4rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h1 style={{ marginTop: '0.5rem' }}>Recibimos tu solicitud</h1>
          <p className="muted">
            Te avisaremos por correo en menos de <strong>24 horas</strong> cuando tu cuenta este aprobada.
            Mientras tanto, prepara fotos de tus piezas (fondo claro, luz natural).
          </p>
          <Link to="/" className="btn accent" style={{ marginTop: '1rem' }}>Volver al inicio</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page" role="main">
      <Seo
        title="Registrate como artesano"
        description="Vende tus artesanías en Manos Creadoras. 0% comisión los primeros 3 meses."
      />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="section-header">
          <div>
            <h1 className="section-title">Crea tu cuenta de artesano</h1>
            <p className="section-subtitle">Aprobacion en menos de 24 horas. 0% comision los primeros 3 meses.</p>
          </div>
        </div>

        <form onSubmit={submit} className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem', marginTop: '1rem' }} noValidate>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              Nombre completo *
              <input value={form.name} onChange={update('name')} required minLength={2} maxLength={100} placeholder="Maria Garcia" />
            </label>
            <label>
              Correo electronico *
              <input type="email" value={form.email} onChange={update('email')} required autoComplete="email" placeholder="tu@correo.com" />
            </label>
          </div>

          <label>
            Contrasena *
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Min 8 chars con mayus, num y especial"
            />
            <span className="muted" style={{ fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>
              Minimo 8 caracteres con mayuscula, minuscula, numero y caracter especial.
            </span>
          </label>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              Oficio *
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

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              WhatsApp *
              <input value={form.whatsapp} onChange={update('whatsapp')} required minLength={7} maxLength={20} placeholder="3001234567" inputMode="tel" />
            </label>
            <label>
              Instagram (opcional)
              <input value={form.instagram} onChange={update('instagram')} maxLength={80} placeholder="@tutaller" />
            </label>
          </div>

          <label>
            Cuentanos sobre tus piezas (opcional)
            <textarea
              value={form.applicationNotes}
              onChange={update('applicationNotes')}
              maxLength={500}
              rows={4}
              placeholder="Que haces, hace cuanto, donde aprendiste, que te diferencia..."
            />
          </label>

          <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
            Al enviar aceptas que revisemos tu informacion. Te contactaremos por correo y WhatsApp.
          </p>

          <button className="btn accent" disabled={submitting} style={{ padding: '0.85rem' }}>
            {submitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>

          <p className="muted" style={{ textAlign: 'center', fontSize: '0.85rem', margin: 0 }}>
            ¿Solo quieres comprar? <Link to="/registro" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Crea cuenta de comprador</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
