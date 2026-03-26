import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import Table from '../components/Table';
import Modal from '../components/Modal';

const EMPTY_FORM = { title: '', description: '', price: '', stock: '', category: '', images: '' };

export default function ProductManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    const params = user.role === 'artisan' ? { artisan: user._id || user.userId } : {};
    api.get('/products', { params })
      .then(({ data }) => setProducts(data.data || data))
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      images: (product.images || []).join(', '),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
        toast.success('Producto actualizado');
      } else {
        await api.post('/products', payload);
        toast.success('Producto creado');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Producto eliminado');
      fetchProducts();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (!user) return <div className="page"><div className="empty-state"><h3>Inicia sesion</h3><Link to="/login" className="btn accent" style={{ marginTop: '1rem' }}>Iniciar sesion</Link></div></div>;
  if (loading) return <Spinner />;

  return (
    <main className="page" role="main">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>Productos</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Gestion de productos</h1>
          <p className="section-subtitle">{products.length} productos registrados</p>
        </div>
        <button className="btn accent" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          Nuevo producto
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem' }}>
        <Table
          columns={[
            { key: 'title', label: 'Producto', render: (r) => <span style={{ fontWeight: 500 }}>{r.title}</span> },
            { key: 'category', label: 'Categoria', render: (r) => <span className="pill accent">{r.category}</span> },
            { key: 'price', label: 'Precio', render: (r) => <span style={{ fontWeight: 600 }}>${r.price}</span> },
            { key: 'stock', label: 'Stock', render: (r) => (
              <span style={{ fontWeight: 600, color: r.stock === 0 ? 'var(--error)' : r.stock <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                {r.stock}
              </span>
            )},
            { key: 'soldCount', label: 'Vendidos', render: (r) => r.soldCount || 0 },
            { key: 'actions', label: '', render: (r) => (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }} onClick={() => openEdit(r)}>Editar</button>
                <button className="btn" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', background: 'var(--error)' }} onClick={() => handleDelete(r._id)}>Eliminar</button>
              </div>
            )},
          ]}
          data={products}
          emptyMessage="No tienes productos. Crea tu primer producto!"
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label>
            Nombre del producto
            <input style={{ width: '100%', marginTop: '0.4rem' }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={3} />
          </label>
          <label>
            Descripcion
            <textarea style={{ width: '100%', marginTop: '0.4rem', minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>
              Precio ($)
              <input type="number" min="0" step="0.01" style={{ width: '100%', marginTop: '0.4rem' }} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </label>
            <label>
              Stock
              <input type="number" min="0" style={{ width: '100%', marginTop: '0.4rem' }} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </label>
          </div>
          <label>
            Categoria
            <select style={{ width: '100%', marginTop: '0.4rem' }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              <option value="">Seleccionar...</option>
              <option value="ceramica">Ceramica</option>
              <option value="tejidos">Tejidos</option>
              <option value="madera">Madera</option>
              <option value="joyeria">Joyeria</option>
              <option value="cuero">Cuero</option>
              <option value="pintura">Pintura</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label>
            URLs de imagenes (separadas por coma)
            <input style={{ width: '100%', marginTop: '0.4rem' }} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="url1, url2" />
          </label>
          <button className="btn accent" style={{ marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? 'Guardando...' : editing ? 'Actualizar producto' : 'Crear producto'}
          </button>
        </form>
      </Modal>
    </main>
  );
}
