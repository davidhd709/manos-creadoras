import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import api from '../api';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const { passwordChanged } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('La nueva contrasena debe tener al menos 8 caracteres');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Contrasena actualizada exitosamente');
      passwordChanged();
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cambiar la contrasena';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page" role="main" style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="card" style={{ marginTop: '3rem', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h1 style={{ marginTop: '1rem', fontSize: '1.5rem' }}>Cambiar contrasena</h1>
          <p className="muted">Por seguridad, debes cambiar tu contrasena provisional antes de continuar</p>
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label>
            Contrasena actual
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
              style={{ width: '100%', marginTop: '0.4rem' }}
              placeholder="Tu contrasena provisional"
            />
          </label>
          <label>
            Nueva contrasena
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
              minLength={8}
              style={{ width: '100%', marginTop: '0.4rem' }}
              placeholder="Minimo 8 caracteres"
            />
          </label>
          <label>
            Confirmar nueva contrasena
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              minLength={8}
              style={{ width: '100%', marginTop: '0.4rem' }}
              placeholder="Repite la nueva contrasena"
            />
          </label>
          <button className="btn accent" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? 'Actualizando...' : 'Cambiar contrasena'}
          </button>
        </form>
      </div>
    </main>
  );
}
