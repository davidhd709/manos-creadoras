import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';

export default function ArtisanProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    logo: '',
    description: '',
    phone: '',
    city: '',
    department: '',
    website: '',
    nit: '',
    bankAccount: '',
    bankName: '',
    socialMedia: { facebook: '', instagram: '', whatsapp: '' },
  });

  useEffect(() => {
    api.get('/artisan-profiles/me')
      .then(({ data }) => {
        if (data) {
          setForm({
            businessName: data.businessName || '',
            logo: data.logo || '',
            description: data.description || '',
            phone: data.phone || '',
            city: data.city || '',
            department: data.department || '',
            website: data.website || '',
            nit: data.nit || '',
            bankAccount: data.bankAccount || '',
            bankName: data.bankName || '',
            socialMedia: {
              facebook: data.socialMedia?.facebook || '',
              instagram: data.socialMedia?.instagram || '',
              whatsapp: data.socialMedia?.whatsapp || '',
            },
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
      await api.put('/artisan-profiles/me', form);
      toast.success('Perfil de negocio actualizado');
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
        <span style={{ color: 'var(--text)' }}>Perfil de negocio</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Perfil de negocio</h1>
          <p className="section-subtitle">Configura los datos de tu emprendimiento</p>
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: '2rem', marginTop: '1.5rem' }}>
        {/* Datos principales */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Datos del negocio</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <label style={{ gridColumn: '1 / -1' }}>
              Nombre del negocio *
              <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required style={{ width: '100%', marginTop: '0.4rem' }} placeholder="Ej: Artesanias Maria" />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Descripcion del negocio
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', marginTop: '0.4rem', minHeight: 80 }} placeholder="Cuenta la historia de tu negocio..." />
            </label>
            <label>
              URL del logo
              <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} placeholder="https://..." />
            </label>
            <label>
              Sitio web
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} placeholder="https://..." />
            </label>
          </div>
        </div>

        {/* Ubicacion */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Ubicacion y contacto</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <label>
              Ciudad
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
            <label>
              Departamento
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
            <label>
              Telefono
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
            <label>
              NIT / Registro mercantil
              <input value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
          </div>
        </div>

        {/* Datos bancarios */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Datos bancarios</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <label>
              Banco
              <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
            <label>
              Numero de cuenta
              <input value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Redes sociales</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            <label>
              Facebook
              <input value={form.socialMedia.facebook} onChange={(e) => setForm({ ...form, socialMedia: { ...form.socialMedia, facebook: e.target.value } })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
            <label>
              Instagram
              <input value={form.socialMedia.instagram} onChange={(e) => setForm({ ...form, socialMedia: { ...form.socialMedia, instagram: e.target.value } })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
            <label>
              WhatsApp
              <input value={form.socialMedia.whatsapp} onChange={(e) => setForm({ ...form, socialMedia: { ...form.socialMedia, whatsapp: e.target.value } })} style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
          </div>
        </div>

        <button className="btn accent" style={{ padding: '0.85rem', fontSize: '1rem' }} disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar perfil de negocio'}
        </button>
      </form>
    </main>
  );
}
