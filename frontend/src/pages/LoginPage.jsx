import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';

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

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Bienvenido de vuelta');
      } else {
        await register({ ...form, role: 'buyer' });
        toast.success('Cuenta creada exitosamente');
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error de autenticacion';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page" role="main">
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
          <div className="auth-mode-indicator" aria-hidden="true">
            {mode === 'login' ? <LockIcon /> : <UserPlusIcon />}
          </div>

          <h1 id="auth-title">{mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}</h1>
          <p className="subtitle">
            {mode === 'login'
              ? 'Ingresa tus credenciales para continuar'
              : 'Registrate como comprador para explorar el catalogo'
            }
          </p>

          <form className="auth-form" onSubmit={submit} noValidate aria-labelledby="auth-title">
            {mode === 'register' && (
              <label htmlFor="name">
                Nombre completo
                <input
                  id="name"
                  placeholder="Ej: Maria Garcia"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="name"
                  minLength={2}
                />
              </label>
            )}
            <label htmlFor="email">
              Correo electronico
              <input
                id="email"
                placeholder="tu@email.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </label>
            <label htmlFor="password">
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Contrasena</span>
                {mode === 'login' && (
                  <Link to="/recuperar-contrasena" style={{ fontSize: '0.78rem', color: 'var(--accent-dark)', fontWeight: 500 }}>
                    Olvidaste tu contrasena?
                  </Link>
                )}
              </span>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  placeholder={mode === 'register' ? 'Min 8 chars, mayuscula, numero y especial' : 'Tu contrasena'}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  aria-describedby={mode === 'register' ? 'password-hint' : undefined}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
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
              {mode === 'register' && (
                <span id="password-hint" style={{ fontSize: '0.75rem', color: form.password.length > 0 && form.password.length < 8 ? 'var(--error)' : 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                  Minimo 8 caracteres con mayuscula, minuscula, numero y caracter especial
                </span>
              )}
            </label>
            <button className="btn accent" style={{ width: '100%', padding: '0.85rem', marginTop: '0.25rem' }} disabled={submitting}>
              {submitting ? 'Procesando...' : mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-divider"><span>o</span></div>

          <div className="auth-toggle">
            {mode === 'login' ? (
              <>No tienes cuenta? <button type="button" onClick={() => setMode('register')}>Crea una gratis</button></>
            ) : (
              <>Ya tienes cuenta? <button type="button" onClick={() => setMode('login')}>Inicia sesion</button></>
            )}
          </div>

          <p className="auth-footer-text">
            Al continuar, aceptas nuestros terminos de servicio y politica de privacidad.
          </p>
        </div>
      </div>
    </main>
  );
}
