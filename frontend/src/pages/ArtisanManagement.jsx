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
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    documentType: 'CC',
    documentNumber: '',
    provisionalPassword: '',
  });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/users/role/artisan').then(({ data }) => setArtisans(data)),
      api.get('/users/artisans/pending').then(({ data }) => setPending(data)).catch(() => setPending([])),
    ])
      .catch(() => toast.error('Error al cargar artesanos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const approve = async (id) => {
    setActionId(id);
    try {
      await api.patch(`/users/artisans/${id}/approve`);
      toast.success('Artesano aprobado y notificado por correo');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo aprobar');
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Motivo (opcional, se enviara por correo):');
    if (reason === null) return;
    setActionId(id);
    try {
      await api.patch(`/users/artisans/${id}/reject`, { reason });
      toast.success('Solicitud rechazada');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo rechazar');
    } finally {
      setActionId(null);
    }
  };

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
      fetchAll();
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

      {pending.length > 0 && (
        <section className="card" style={{ padding: '1.25rem', marginTop: '1.5rem', border: '1px solid var(--warning-light)', background: '#fffaf3' }}>
          <h3 style={{ margin: '0 0 0.25rem' }}>Solicitudes pendientes ({pending.length})</h3>
          <p className="muted" style={{ margin: '0 0 1rem', fontSize: '0.85rem' }}>
            Revisa la informacion y aprueba para que el artesano pueda ingresar y publicar.
          </p>
          <div className="grid" style={{ gap: '0.75rem' }}>
            {pending.map((p) => (
              <div key={p._id} className="card" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <strong>{p.name}</strong>
                  <span className="muted" style={{ display: 'block', fontSize: '0.82rem' }}>{p.email}</span>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
                    <span><strong>Oficio:</strong> {p.craft || '—'}</span>{' · '}
                    <span><strong>Region:</strong> {p.region || '—'}</span>{' · '}
                    <span><strong>WhatsApp:</strong> {p.whatsapp || '—'}</span>
                    {p.instagram && <> · <span><strong>IG:</strong> {p.instagram}</span></>}
                  </div>
                  {p.applicationNotes && (
                    <p className="muted" style={{ margin: '0.4rem 0 0', fontSize: '0.82rem' }}>{p.applicationNotes}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn accent" disabled={actionId === p._id} onClick={() => approve(p._id)}>
                    {actionId === p._id ? '...' : 'Aprobar'}
                  </button>
                  <button className="btn secondary" disabled={actionId === p._id} onClick={() => reject(p._id)}>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
