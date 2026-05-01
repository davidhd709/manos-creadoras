import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Ingresa tu nombre completo';
  else if (form.name.trim().length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres';
  if (!form.email.trim()) errors.email = 'Ingresa tu correo electrónico';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'El correo no tiene un formato válido';
  if (!form.password) errors.password = 'Crea una contraseña';
  else if (form.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
  return errors;
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
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
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(`reg-${firstKey}`)?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);
    track('sign_up_started', { role: 'buyer' });
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'buyer',
      });
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
      <Seo title="Crea tu cuenta de comprador" description="Crea tu cuenta gratis en Manos Creadoras y descubre artesanías hechas en Colombia." noindex />
      <div className="auth-visual">
        <div className="auth-visual-img" aria-hidden="true" />
        <div className="auth-visual-overlay" aria-hidden="true" />
        <div className="auth-visual-content">
          <h2 className="auth-headline">Lo hecho en Colombia,<br />directo del <em>taller</em></h2>
          <p className="auth-subtext">Crea tu cuenta y descubre piezas únicas con envío a todo el país.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <h1 id="auth-title">Crear cuenta</h1>
          <p className="subtitle">Regístrate como comprador para explorar el catálogo y guardar pedidos.</p>

          <form className="auth-form" onSubmit={submit} noValidate aria-labelledby="auth-title">
            <label htmlFor="reg-name">
              Nombre completo
              <input
                id="reg-name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                autoComplete="name"
                placeholder="María García"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'reg-name-error' : undefined}
                style={errors.name && touched.name ? { borderColor: 'var(--error)' } : undefined}
              />
              {errors.name && touched.name && (
                <span id="reg-name-error" role="alert" className="form-error">{errors.name}</span>
              )}
            </label>
            <label htmlFor="reg-email">
              Correo electrónico
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
                placeholder="tu@correo.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'reg-email-error' : undefined}
                style={errors.email && touched.email ? { borderColor: 'var(--error)' } : undefined}
              />
              {errors.email && touched.email && (
                <span id="reg-email-error" role="alert" className="form-error">{errors.email}</span>
              )}
            </label>
            <label htmlFor="reg-password">
              Contraseña
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres con mayúscula, número y especial"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'reg-password-error' : undefined}
                style={errors.password && touched.password ? { borderColor: 'var(--error)' } : undefined}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: 'var(--accent-dark)', cursor: 'pointer', fontSize: '0.78rem', padding: '0.25rem 0', textAlign: 'left' }}>
                {showPassword ? 'Ocultar' : 'Mostrar'} contraseña
              </button>
              {errors.password && touched.password && (
                <span id="reg-password-error" role="alert" className="form-error">{errors.password}</span>
              )}
            </label>
            <button className="btn accent" style={{ width: '100%', padding: '0.85rem' }} disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-divider"><span>o</span></div>

          <div className="auth-toggle">
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Inicia sesión</Link>
          </div>

          <p className="auth-footer-text">
            ¿Eres artesano? <Link to="/vende" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Vende en Manos Creadoras</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
