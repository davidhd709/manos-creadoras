import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';

export default function BuyerProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    address: '',
    city: '',
    department: '',
    postalCode: '',
  });

  useEffect(() => {
    api.get('/clients/me')
      .then(({ data }) => {
        if (data) {
          setForm({
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            department: data.department || '',
            postalCode: data.postalCode || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/clients/me', form);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <main className="page" role="main">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>Mi perfil</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Mi perfil</h1>
          <p className="section-subtitle">Completa tu direccion de envio para poder realizar pedidos</p>
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Direccion de envio</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <label style={{ gridColumn: '1 / -1' }}>
              Direccion *
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required style={{ width: '100%', marginTop: '0.4rem' }} placeholder="Calle, numero, barrio..." />
            </label>
            <label>
              Ciudad *
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required style={{ width: '100%', marginTop: '0.4rem' }} placeholder="Ej: Bogota" />
            </label>
            <label>
              Departamento
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} placeholder="Ej: Cundinamarca" />
            </label>
            <label>
              Codigo postal
              <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} placeholder="Ej: 110111" />
            </label>
            <label>
              Telefono
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} placeholder="Ej: 300 123 4567" />
            </label>
          </div>
        </div>

        <button className="btn accent" style={{ padding: '0.85rem', fontSize: '1rem' }} disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </form>
    </main>
  );
}
