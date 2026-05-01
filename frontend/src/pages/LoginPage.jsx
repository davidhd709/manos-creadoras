import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Seo from '../lib/Seo';

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {open ? (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
      </>
    )}
  </svg>
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = 'Ingresa tu correo electrónico';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'El correo no tiene un formato válido';
  if (!form.password) errors.password = 'Ingresa tu contraseña';
  return errors;
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleBlur = (key) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(form));
  };

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setTouched({ email: true, password: true });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Bienvenido de vuelta');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error de autenticación';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page" role="main">
      <Seo title="Iniciar sesión" description="Ingresa a tu cuenta de Manos Creadoras." noindex />
      <div className="auth-visual">
        <div className="auth-visual-img" aria-hidden="true" />
        <div className="auth-visual-overlay" aria-hidden="true" />
        <div className="auth-visual-content">
          <h2 className="auth-headline">
            Donde cada pieza<br />tiene <em>historia</em>
          </h2>
          <p className="auth-subtext">
            Miles de artesanos latinoamericanos comparten su arte contigo. Cada compra transforma una vida.
          </p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <div className="auth-mode-indicator" aria-hidden="true"><LockIcon /></div>

          <h1 id="auth-title">Iniciar sesión</h1>
          <p className="subtitle">Ingresa tus credenciales para continuar.</p>

          <form className="auth-form" onSubmit={submit} noValidate aria-labelledby="auth-title">
            <label htmlFor="email">
              Correo electrónico
              <input
                id="email"
                placeholder="tu@email.com"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                style={errors.email && touched.email ? { borderColor: 'var(--error)' } : undefined}
              />
              {errors.email && touched.email && (
                <span id="email-error" role="alert" className="form-error">{errors.email}</span>
              )}
            </label>
            <label htmlFor="password">
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Contraseña</span>
                <Link to="/recuperar-contrasena" style={{ fontSize: '0.78rem', color: 'var(--accent-dark)', fontWeight: 500 }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </span>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  placeholder="Tu contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  style={{
                    paddingRight: '2.5rem',
                    ...(errors.password && touched.password ? { borderColor: 'var(--error)' } : {}),
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && touched.password && (
                <span id="password-error" role="alert" className="form-error">{errors.password}</span>
              )}
            </label>
            <button className="btn accent" style={{ width: '100%', padding: '0.85rem', marginTop: '0.25rem' }} disabled={submitting}>
              {submitting ? 'Procesando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="auth-divider"><span>o</span></div>

          <div className="auth-toggle">
            ¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Crea una gratis</Link>
          </div>

          <noscript>JavaScript es necesario para iniciar sesión.</noscript>

          <p className="auth-footer-text">
            ¿Eres artesano? <Link to="/vende" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Vende en Manos Creadoras</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
