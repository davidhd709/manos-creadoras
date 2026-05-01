import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../ui/Toast';

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
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

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
      toast.success('Contrasena restablecida exitosamente');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al restablecer';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <main className="page" role="main">
        <div className="empty-state" role="alert">
          <h3>Token inválido</h3>
          <p className="muted">El enlace de restablecimiento es inválido o está incompleto.</p>
          <Link to="/recuperar-contraseña" className="btn accent" style={{ marginTop: '1rem' }}>
            Solicitar nuevo enlace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page" role="main">
      <div className="auth-visual">
        <div className="auth-visual-img" aria-hidden="true" />
        <div className="auth-visual-overlay" aria-hidden="true" />
        <div className="auth-visual-content">
          <h2 className="auth-headline">Crea una nueva contraseña</h2>
          <p className="auth-subtext">Asegúrate de que sea segura y diferente a las anteriores.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <div className="auth-mode-indicator" aria-hidden="true">
            <KeyIcon />
          </div>

          <h1>Nueva contraseña</h1>
          <p className="subtitle">Ingresa tu nueva contraseña. Será válida inmediatamente.</p>

          <form className="auth-form" onSubmit={submit} noValidate>
            <label htmlFor="newPassword">
              Nueva contraseña
              <div style={{ position: 'relative' }}>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres con mayúscula, número y especial"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-describedby="password-hint"
                  style={{ paddingRight: '2.5rem' }}
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
              <span id="password-hint" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                Mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial
              </span>
            </label>
            <label htmlFor="confirm">
              Confirmar contraseña
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
                autoComplete="new-password"
              />
              {form.confirm && form.newPassword !== form.confirm && (
                <span style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', display: 'block' }} role="alert">
                  Las contraseñas no coinciden
                </span>
              )}
            </label>
            <button
              className="btn accent"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.25rem' }}
              disabled={submitting || !form.newPassword || form.newPassword !== form.confirm}
            >
              {submitting ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
