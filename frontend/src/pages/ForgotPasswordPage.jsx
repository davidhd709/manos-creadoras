import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../ui/Toast';

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al solicitar restablecimiento';
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
          <h2 className="auth-headline">Recupera tu acceso</h2>
          <p className="auth-subtext">
            Te enviaremos un enlace seguro a tu correo para restablecer tu contrasena.
          </p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <div className="auth-mode-indicator" aria-hidden="true">
            <MailIcon />
          </div>

          <h1>Olvidaste tu contrasena?</h1>
          <p className="subtitle">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>

          {sent ? (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: '12px' }} role="status">
              <h3 style={{ color: 'var(--success)', marginTop: 0 }}>Revisa tu correo</h3>
              <p style={{ color: 'var(--text)' }}>
                Si el correo existe, recibiras un enlace para restablecer tu contrasena.
                El enlace expira en 1 hora.
              </p>
              <Link to="/login" className="btn accent" style={{ marginTop: '1rem' }}>
                Volver al inicio de sesion
              </Link>
            </div>
          ) : (
            <>
              <form className="auth-form" onSubmit={submit} noValidate>
                <label htmlFor="email">
                  Correo electronico
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>
                <button
                  className="btn accent"
                  style={{ width: '100%', padding: '0.85rem', marginTop: '0.25rem' }}
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>

              <div className="auth-divider"><span>o</span></div>

              <div className="auth-toggle">
                <Link to="/login">Volver a iniciar sesion</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
