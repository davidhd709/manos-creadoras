import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';
import { useToast } from '../ui/Toast';

const REGIONS = [
  'Antioquia', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Cauca',
  'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
  'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'Santander', 'Sucre',
  'Tolima', 'Valle del Cauca', 'Otra',
];

const CRAFTS = [
  'Cerámica', 'Tejido (mochilas, telar)', 'Joyería y filigrana', 'Madera y tallado',
  'Cuero', 'Vidrio', 'Iraca y palma', 'Mopa-mopa', 'Pintura y arte', 'Otra',
];

const SIDE_BENEFITS = [
  { icon: '⏱️', text: 'Aprobación en menos de 24 horas hábiles.' },
  { icon: '🎁', text: '0% de comisión los primeros 3 meses.' },
  { icon: '💬', text: 'Soporte directo por WhatsApp con el equipo.' },
  { icon: '🪪', text: 'Vitrina propia con URL única para compartir.' },
];

function evaluatePassword(pwd) {
  if (!pwd) return { score: 0, label: '', color: 'var(--border)' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte', 'Muy fuerte'];
  const colors = [
    'var(--error)',
    'var(--error)',
    'var(--warning)',
    'var(--accent-dark)',
    'var(--success)',
    'var(--success)',
  ];
  return { score, label: labels[score], color: colors[score] };
}

export default function ArtisanRegisterPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const pwdStrength = useMemo(() => evaluatePassword(form.password), [form.password]);

  const submit = async (e) => {
    e.preventDefault();
    if (pwdStrength.score < 3) {
      toast.error('Tu contraseña es débil. Combina mayúsculas, minúsculas, números y un carácter especial.');
      return;
    }
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
        <div className="card" style={{ padding: '2.5rem 2rem', maxWidth: 580, margin: '4rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h1 style={{ marginTop: '0.5rem' }}>Recibimos tu solicitud</h1>
          <p className="muted" style={{ lineHeight: 1.6 }}>
            Te avisaremos por correo y WhatsApp en menos de <strong>24 horas hábiles</strong> cuando tu cuenta esté aprobada.
          </p>
          <div className="success-checklist">
            <div><span>✓</span> Prepara fotos de tus piezas (fondo claro, luz natural)</div>
            <div><span>✓</span> Piensa en una frase corta sobre tu taller</div>
            <div><span>✓</span> Recopila datos bancarios para que te paguen</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/')}>
              Volver al inicio
            </button>
            <Link to="/artesanos" className="btn accent">
              Ver otros artesanos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page" role="main">
      <Seo
        title="Regístrate como artesano"
        description="Vende tus artesanías en Manos Creadoras. 0% comisión los primeros 3 meses."
      />
      <div className="register-grid">
        <div>
          <nav style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>
            {' / '}
            <Link to="/vende" style={{ color: 'var(--text-secondary)' }}>Vende</Link>
            {' / '}
            <span style={{ color: 'var(--text)' }}>Registro</span>
          </nav>

          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h1 className="section-title">Crea tu cuenta de artesano</h1>
              <p className="section-subtitle">Aprobación en menos de 24 horas. 0% comisión los primeros 3 meses.</p>
            </div>
          </div>

          <form onSubmit={submit} className="card register-form" noValidate>
            <h2 className="register-section-title">Tus datos personales</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <label>
                Nombre completo *
                <input value={form.name} onChange={update('name')} required minLength={2} maxLength={100} placeholder="María García" />
              </label>
              <label>
                Correo electrónico *
                <input type="email" value={form.email} onChange={update('email')} required autoComplete="email" placeholder="tu@correo.com" />
              </label>
            </div>

            <label>
              Contraseña *
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div className="password-strength">
                  <div className="password-strength-bar">
                    <div
                      className="password-strength-fill"
                      style={{ width: `${(pwdStrength.score / 5) * 100}%`, background: pwdStrength.color }}
                    />
                  </div>
                  <span style={{ color: pwdStrength.color, fontSize: '0.78rem', fontWeight: 600 }}>
                    {pwdStrength.label}
                  </span>
                </div>
              )}
              <span className="muted" style={{ fontSize: '0.78rem', display: 'block', marginTop: '0.4rem' }}>
                Combina mayúsculas, minúsculas, números y un carácter especial.
              </span>
            </label>

            <h2 className="register-section-title">Tu oficio y región</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <label>
                Oficio *
                <select value={form.craft} onChange={update('craft')} required>
                  <option value="">Selecciona...</option>
                  {CRAFTS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                Región / departamento *
                <select value={form.region} onChange={update('region')} required>
                  <option value="">Selecciona...</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
            </div>

            <h2 className="register-section-title">Cómo te contactamos</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <label>
                WhatsApp *
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={update('whatsapp')}
                  required
                  minLength={7}
                  maxLength={20}
                  placeholder="3001234567"
                  inputMode="tel"
                />
                <span className="muted" style={{ fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>
                  Lo usamos para avisarte cuando tu cuenta esté aprobada.
                </span>
              </label>
              <label>
                Instagram (opcional)
                <input value={form.instagram} onChange={update('instagram')} maxLength={80} placeholder="@tutaller" />
              </label>
            </div>

            <label>
              Cuéntanos sobre tus piezas (opcional)
              <textarea
                value={form.applicationNotes}
                onChange={update('applicationNotes')}
                maxLength={500}
                rows={4}
                placeholder="Qué haces, hace cuánto, dónde aprendiste, qué te diferencia..."
              />
              <span className="muted" style={{ fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>
                Esto nos ayuda a aprobarte más rápido y a destacarte mejor.
              </span>
            </label>

            <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
              Al enviar aceptas que revisemos tu información. Te contactaremos por correo y WhatsApp.
            </p>

            <button className="btn accent" disabled={submitting} style={{ padding: '0.85rem' }}>
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>

            <p className="muted" style={{ textAlign: 'center', fontSize: '0.85rem', margin: 0 }}>
              ¿Solo quieres comprar?{' '}
              <Link to="/registro" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>
                Crea cuenta de comprador
              </Link>
            </p>
          </form>
        </div>

        <aside className="register-aside" aria-label="Por qué registrarte">
          <div className="card register-aside-card">
            <h3 style={{ margin: '0 0 0.85rem', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem' }}>
              Lo que recibes al registrarte
            </h3>
            <ul className="register-aside-list">
              {SIDE_BENEFITS.map((b) => (
                <li key={b.text}>
                  <span aria-hidden="true">{b.icon}</span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
            <div className="register-aside-quote">
              <p>"En 10 días ya tenía mis primeras 3 ventas a Bogotá. Antes solo vendía a turistas."</p>
              <span className="muted">— Don Carlos, ceramista en Ráquira</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
