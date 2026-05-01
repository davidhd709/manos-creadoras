import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../ui/Toast';

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const REQUIRED_FIELDS = ['address', 'city', 'phone'];

function isComplete(profile) {
  if (!profile) return false;
  return REQUIRED_FIELDS.every((f) => profile[f] && String(profile[f]).trim().length > 0);
}

export default function ShippingProfileBlock({ onReadyChange }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    address: '',
    city: '',
    department: '',
    postalCode: '',
  });

  useEffect(() => {
    api
      .get('/clients/me')
      .then(({ data }) => {
        setProfile(data || null);
        setForm({
          phone: data?.phone || '',
          address: data?.address || '',
          city: data?.city || '',
          department: data?.department || '',
          postalCode: data?.postalCode || '',
        });
        if (!isComplete(data)) setEditing(true);
      })
      .catch(() => {
        setEditing(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (onReadyChange) onReadyChange(isComplete(profile));
  }, [profile, onReadyChange]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim() || !form.phone.trim()) {
      toast.error('Dirección, ciudad y teléfono son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/clients/me', form);
      setProfile(data || form);
      setEditing(false);
      toast.success('Datos de envío guardados');
    } catch (err) {
      const msg = err.response?.data?.message || 'No pudimos guardar tus datos';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="card" style={{ padding: '1.25rem' }}>
        <p className="muted" style={{ margin: 0 }}>Cargando datos de envío...</p>
      </section>
    );
  }

  const complete = isComplete(profile);

  if (!editing && complete) {
    return (
      <section className="card shipping-card shipping-card-ok" style={{ padding: '1.25rem' }}>
        <div className="shipping-card-header">
          <div className="shipping-card-icon ok"><CheckIcon /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Dirección de envío</h3>
            <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.82rem' }}>Lista para coordinar el pedido</p>
          </div>
          <button type="button" className="btn-icon" onClick={() => setEditing(true)} aria-label="Editar dirección">
            <EditIcon />
          </button>
        </div>
        <div className="shipping-card-body">
          <p style={{ margin: 0 }}>
            <strong>{profile.address}</strong><br />
            {profile.city}{profile.department ? `, ${profile.department}` : ''}
            {profile.postalCode ? ` · CP ${profile.postalCode}` : ''}
          </p>
          <p className="muted" style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
            Teléfono de contacto: <strong style={{ color: 'var(--text)' }}>{profile.phone}</strong>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card shipping-card shipping-card-pending" style={{ padding: '1.25rem' }}>
      <div className="shipping-card-header">
        <div className="shipping-card-icon warning"><AlertIcon /></div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>
            {complete ? 'Editar dirección de envío' : 'Completa tu dirección de envío'}
          </h3>
          <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.82rem' }}>
            {complete ? 'Modifica los datos antes de confirmar' : 'Necesitamos estos datos para que el artesano pueda enviarte el pedido'}
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="shipping-form">
        <label className="shipping-field shipping-field-full">
          <span>Dirección *</span>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
            placeholder="Calle, número, barrio..."
          />
        </label>
        <label className="shipping-field">
          <span>Ciudad *</span>
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
            placeholder="Bogotá"
          />
        </label>
        <label className="shipping-field">
          <span>Departamento</span>
          <input
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="Cundinamarca"
          />
        </label>
        <label className="shipping-field">
          <span>Teléfono *</span>
          <input
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            placeholder="300 123 4567"
          />
        </label>
        <label className="shipping-field">
          <span>Código postal</span>
          <input
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            placeholder="110111"
          />
        </label>
        <div className="shipping-form-actions">
          <button type="submit" className="btn accent" disabled={saving}>
            {saving ? 'Guardando…' : complete ? 'Actualizar datos' : 'Guardar y continuar'}
          </button>
          {complete && (
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setEditing(false);
                setForm({
                  phone: profile.phone || '',
                  address: profile.address || '',
                  city: profile.city || '',
                  department: profile.department || '',
                  postalCode: profile.postalCode || '',
                });
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
