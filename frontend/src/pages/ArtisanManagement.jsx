import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import Table from '../components/Table';
import Modal from '../components/Modal';

export default function ArtisanManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    documentType: 'CC',
    documentNumber: '',
    provisionalPassword: '',
  });

  const fetchArtisans = () => {
    setLoading(true);
    api.get('/users/role/artisan')
      .then(({ data }) => setArtisans(data))
      .catch(() => toast.error('Error al cargar artesanos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArtisans(); }, []);

  const openCreate = () => {
    setForm({ name: '', email: '', documentType: 'CC', documentNumber: '', provisionalPassword: '' });
    setModalOpen(true);
  };

  const createArtisan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users/artisans', {
        ...form,
        provisionalPassword: form.provisionalPassword || undefined,
      });
      toast.success('Artesano creado. Se envio un correo con las credenciales.');
      setModalOpen(false);
      fetchArtisans();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear artesano';
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
        <span style={{ color: 'var(--text)' }}>Gestion de artesanos</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Gestion de artesanos</h1>
          <p className="section-subtitle">{artisans.length} artesano(s) registrado(s)</p>
        </div>
        <button className="btn accent" onClick={openCreate}>Crear artesano</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem' }}>
        <Table
          columns={[
            { key: 'name', label: 'Nombre', render: (r) => <span style={{ fontWeight: 500 }}>{r.name}</span> },
            { key: 'email', label: 'Correo' },
            { key: 'documentType', label: 'Tipo Doc.', render: (r) => r.documentType || '-' },
            { key: 'documentNumber', label: 'No. Documento', render: (r) => r.documentNumber || '-' },
            { key: 'status', label: 'Estado', render: (r) => (
              <span style={{
                display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                background: r.isActive !== false ? 'var(--success-light, #e8f5e9)' : 'var(--error-light, #ffebee)',
                color: r.isActive !== false ? 'var(--success, #4caf50)' : 'var(--error, #f44336)',
              }}>
                {r.isActive !== false ? 'Activo' : 'Inactivo'}
              </span>
            )},
            { key: 'mustChange', label: 'Password', render: (r) => (
              <span style={{
                display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                background: r.mustChangePassword ? 'var(--warning-light, #fff3e0)' : 'var(--success-light, #e8f5e9)',
                color: r.mustChangePassword ? 'var(--warning, #ff9800)' : 'var(--success, #4caf50)',
              }}>
                {r.mustChangePassword ? 'Provisional' : 'Cambiada'}
              </span>
            )},
          ]}
          data={artisans}
          emptyMessage="No hay artesanos registrados"
        />
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Crear nuevo artesano">
        <form onSubmit={createArtisan} style={{ display: 'grid', gap: '1.25rem' }}>
          <label>
            Nombre completo *
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', marginTop: '0.4rem' }} placeholder="Nombre del artesano" />
          </label>
          <label>
            Correo electronico *
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ width: '100%', marginTop: '0.4rem' }} placeholder="artesano@email.com" />
          </label>
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <label>
              Tipo documento *
              <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} style={{ width: '100%', marginTop: '0.4rem' }}>
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="NIT">NIT</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </label>
            <label>
              Numero de documento *
              <input value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} required style={{ width: '100%', marginTop: '0.4rem' }} />
            </label>
          </div>
          <label>
            Contrasena provisional (opcional)
            <input type="password" value={form.provisionalPassword} onChange={(e) => setForm({ ...form, provisionalPassword: e.target.value })} minLength={8} style={{ width: '100%', marginTop: '0.4rem' }} placeholder="Se genera automaticamente si se deja vacio" />
          </label>
          <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
            Al crear el artesano, se enviara un correo con las credenciales de acceso al correo registrado.
          </p>
          <button className="btn accent" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear artesano'}
          </button>
        </form>
      </Modal>
    </main>
  );
}
