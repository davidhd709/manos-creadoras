import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [mode, setMode] = useState('login');
  const [submitting, setSubmitting] = useState(false);
  const { login, register, mustChangePassword } = useAuth();
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
      // Redireccion post-login se maneja por ForcePasswordChange si es necesario
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
      {/* Left: Image panel */}
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

      {/* Right: Form */}
      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <div className="auth-mode-indicator">
            {mode === 'login' ? <LockIcon /> : <UserPlusIcon />}
          </div>

          <h1>{mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}</h1>
          <p className="subtitle">
            {mode === 'login'
              ? 'Ingresa tus credenciales para continuar'
              : 'Registrate como comprador para explorar el catalogo'
            }
          </p>

          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <label htmlFor="name">
                Nombre completo
                <input
                  id="name"
                  placeholder="Ej: Maria Garcia"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
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
              />
            </label>
            <label htmlFor="password">
              Contrasena
              <input
                id="password"
                placeholder={mode === 'register' ? 'Min 8 chars, mayuscula, numero y especial' : 'Tu contrasena'}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={mode === 'register' ? 8 : 1}
              />
              {mode === 'register' && form.password.length > 0 && form.password.length < 8 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', display: 'block' }}>
                  Minimo 8 caracteres, una mayuscula, un numero y un caracter especial
                </span>
              )}
            </label>
            <button className="btn accent" style={{ width: '100%', padding: '0.85rem', marginTop: '0.25rem' }} disabled={submitting}>
              {submitting ? 'Procesando...' : mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <div className="auth-toggle">
            {mode === 'login' ? (
              <>No tienes cuenta? <button onClick={() => setMode('register')}>Crea una gratis</button></>
            ) : (
              <>Ya tienes cuenta? <button onClick={() => setMode('login')}>Inicia sesion</button></>
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
