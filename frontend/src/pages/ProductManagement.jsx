import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import Table from '../components/Table';
import Modal from '../components/Modal';
import ImageUpload from '../components/ImageUpload';

const EMPTY_FORM = { title: '', description: '', price: '', stock: '', category: '', images: [] };

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'in_stock', label: 'En stock' },
  { id: 'low_stock', label: 'Bajo stock (≤5)' },
  { id: 'out', label: 'Agotados' },
  { id: 'no_reviews', label: 'Sin reseñas' },
  { id: 'promo', label: 'En oferta' },
];

function formatCOP(value) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

export default function ProductManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // La creación de productos es una acción privada del artesano (POST /products
  // solo lo permite Role.Artisan en el backend). admin/superadmin entran a esta
  // pantalla en modo moderación: pueden ver, editar y eliminar, pero no crear.
  const canCreate = user?.role === 'artisan';

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
    if (!canCreate) {
      toast.error('Solo los artesanos pueden crear productos. Admin y SuperAdmin pueden editar o moderar los existentes.');
      return;
    }
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
      images: product.images || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !canCreate) {
      toast.error('Solo los artesanos pueden crear productos.');
      setModalOpen(false);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        images: form.images || [],
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
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Producto eliminado');
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const stats = useMemo(() => {
    const inStock = products.filter((p) => p.stock > 0).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const noReviews = products.filter((p) => !p.ratingAverage || p.ratingAverage === 0).length;
    const onPromo = products.filter((p) => p.isPromotion).length;
    return { inStock, outOfStock, lowStock, noReviews, onPromo, total: products.length };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (filter === 'in_stock') list = list.filter((p) => p.stock > 0);
    else if (filter === 'low_stock') list = list.filter((p) => p.stock > 0 && p.stock <= 5);
    else if (filter === 'out') list = list.filter((p) => p.stock === 0);
    else if (filter === 'no_reviews') list = list.filter((p) => !p.ratingAverage || p.ratingAverage === 0);
    else if (filter === 'promo') list = list.filter((p) => p.isPromotion);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.title?.toLowerCase().includes(q));
    }
    return list;
  }, [products, filter, search]);

  if (!user) return <div className="page"><div className="empty-state"><h3>Inicia sesión</h3><Link to="/login" className="btn accent" style={{ marginTop: '1rem' }}>Iniciar sesión</Link></div></div>;
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
          <h1 className="section-title">
            {canCreate ? 'Gestión de productos' : 'Productos (moderación)'}
          </h1>
          <p className="section-subtitle">
            {canCreate
              ? `${stats.total} productos registrados`
              : `${stats.total} productos en la plataforma · vista de moderación`}
          </p>
        </div>
        {canCreate && (
          <button className="btn accent" onClick={openCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
            Nuevo producto
          </button>
        )}
      </div>

      <div className="grid pm-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
        <div className="pm-stat"><span className="pm-stat-value">{stats.total}</span><span className="pm-stat-label">Total</span></div>
        <div className="pm-stat pm-stat-success"><span className="pm-stat-value">{stats.inStock}</span><span className="pm-stat-label">En stock</span></div>
        <div className="pm-stat pm-stat-warning"><span className="pm-stat-value">{stats.lowStock}</span><span className="pm-stat-label">Bajo stock</span></div>
        <div className="pm-stat pm-stat-error"><span className="pm-stat-value">{stats.outOfStock}</span><span className="pm-stat-label">Agotados</span></div>
        <div className="pm-stat"><span className="pm-stat-value">{stats.noReviews}</span><span className="pm-stat-label">Sin reseñas</span></div>
        <div className="pm-stat"><span className="pm-stat-value">{stats.onPromo}</span><span className="pm-stat-label">En oferta</span></div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', margin: '1.25rem 0 0.75rem' }}>
        <input
          type="search"
          placeholder="Buscar por título…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: 0 }}
          aria-label="Buscar productos"
        />
        <div className="filter-group" role="group" aria-label="Filtros">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip ${filter === f.id ? 'chip-active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          columns={[
            { key: 'title', label: 'Producto', render: (r) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {r.images?.[0] && (
                  <img src={r.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                )}
                <div>
                  <span style={{ fontWeight: 500, display: 'block' }}>{r.title}</span>
                  {(!r.images || r.images.length === 0) && (
                    <span style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 600 }}>Sin imagen</span>
                  )}
                </div>
              </div>
            )},
            { key: 'category', label: 'Categoría', render: (r) => <span className="pill accent">{r.category}</span> },
            { key: 'price', label: 'Precio', render: (r) => (
              <div>
                <span style={{ fontWeight: 600 }}>{formatCOP(r.isPromotion ? r.promotionPrice : r.price)}</span>
                {r.isPromotion && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textDecoration: 'line-through', display: 'block' }}>
                    {formatCOP(r.price)}
                  </span>
                )}
              </div>
            )},
            { key: 'stock', label: 'Stock', render: (r) => (
              <span style={{ fontWeight: 600, color: r.stock === 0 ? 'var(--error)' : r.stock <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                {r.stock}
              </span>
            )},
            { key: 'soldCount', label: 'Vendidos', render: (r) => r.soldCount || 0 },
            { key: 'rating', label: 'Reseñas', render: (r) => (
              r.ratingAverage > 0
                ? <span>{r.ratingAverage.toFixed(1)}★</span>
                : <span className="muted" style={{ fontSize: '0.78rem' }}>Sin reseñas</span>
            )},
            { key: 'actions', label: '', render: (r) => (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Link to={`/productos/${r._id}`} className="btn secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }} target="_blank" rel="noopener noreferrer">Ver</Link>
                <button className="btn secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }} onClick={() => openEdit(r)}>Editar</button>
                <button className="btn" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', background: 'var(--error)', color: '#fff' }} onClick={() => handleDelete(r._id)}>Eliminar</button>
              </div>
            )},
          ]}
          data={filteredProducts}
          emptyMessage={
            products.length === 0
              ? canCreate
                ? '¡Crea tu primer producto para empezar a vender!'
                : 'Aún no hay productos publicados en la plataforma.'
              : 'Sin resultados para este filtro'
          }
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label>
            Nombre del producto
            <input style={{ width: '100%', marginTop: '0.4rem' }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={3} />
          </label>
          <label>
            Descripción
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
            Categoría
            <select style={{ width: '100%', marginTop: '0.4rem' }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              <option value="">Seleccionar...</option>
              <option value="ceramica">Cerámica</option>
              <option value="tejidos">Tejidos</option>
              <option value="madera">Madera</option>
              <option value="joyeria">Joyería</option>
              <option value="cuero">Cuero</option>
              <option value="pintura">Pintura</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <ImageUpload
            value={form.images}
            onChange={(images) => setForm({ ...form, images })}
          />
          <button className="btn accent" style={{ marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? 'Guardando...' : editing ? 'Actualizar producto' : 'Crear producto'}
          </button>
        </form>
      </Modal>
    </main>
  );
}
