import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    track('sign_up_started', { role: 'buyer' });
    try {
      await register({ ...form, role: 'buyer' });
      track('sign_up_completed', { role: 'buyer' });
      toast.success('Cuenta creada exitosamente');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear cuenta';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page" role="main">
      <Seo title="Crea tu cuenta de comprador" description="Crea tu cuenta gratis en Manos Creadoras y descubre artesanías hechas en Colombia." />
      <div className="auth-visual">
        <div className="auth-visual-img" aria-hidden="true" />
        <div className="auth-visual-overlay" aria-hidden="true" />
        <div className="auth-visual-content">
          <h2 className="auth-headline">Lo hecho en Colombia,<br />directo del <em>taller</em></h2>
          <p className="auth-subtext">Crea tu cuenta y descubre piezas unicas con envio a todo el pais.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <h1 id="auth-title">Crear cuenta</h1>
          <p className="subtitle">Registrate como comprador para explorar el catalogo y guardar pedidos.</p>

          <form className="auth-form" onSubmit={submit} noValidate aria-labelledby="auth-title">
            <label>
              Nombre completo
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoComplete="name" minLength={2} placeholder="Maria Garcia" />
            </label>
            <label>
              Correo electronico
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" placeholder="tu@correo.com" />
            </label>
            <label>
              Contrasena
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min 8 chars con mayus, num y especial"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: 'var(--accent-dark)', cursor: 'pointer', fontSize: '0.78rem', padding: '0.25rem 0', textAlign: 'left' }}>
                {showPassword ? 'Ocultar' : 'Mostrar'} contrasena
              </button>
            </label>
            <button className="btn accent" style={{ width: '100%', padding: '0.85rem' }} disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-divider"><span>o</span></div>

          <div className="auth-toggle">
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Inicia sesion</Link>
          </div>

          <p className="auth-footer-text">
            ¿Eres artesano? <Link to="/vende" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Vende en Manos Creadoras</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
