import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import Table from '../components/Table';
import StatsCard from '../components/StatsCard';
import Modal from '../components/Modal';

export default function InventoryPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [alerts, setAlerts] = useState(null);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [inventorySummary, setInventorySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productHistory, setProductHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [form, setForm] = useState({ type: 'entrada', quantity: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('summary');

  const fetchData = () => {
    setLoading(true);
    const promises = [
      api.get('/inventory/alerts').then(({ data }) => setAlerts(data)),
      api.get('/products').then(({ data }) => setProducts(data.data || data)),
      api.get('/inventory/movements/recent').then(({ data }) => setMovements(data)),
    ];

    if (user?.role === 'artisan') {
      promises.push(
        api.get('/inventory/artisan/summary').then(({ data }) => setInventorySummary(data)).catch(() => {})
      );
    }

    Promise.all(promises)
      .catch(() => toast.error('Error al cargar inventario'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setForm({ type: 'entrada', quantity: '', reason: '' });
    setModalOpen(true);
  };

  const openHistory = async (product) => {
    const productId = product._id || product.product?._id;
    setSelectedProduct(product);
    setHistoryLoading(true);
    setHistoryModalOpen(true);
    try {
      const { data } = await api.get(`/inventory/${productId}/movements`);
      setProductHistory(data);
    } catch {
      toast.error('Error al cargar historial');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/inventory/${selectedProduct._id}/stock`, {
        type: form.type,
        quantity: Number(form.quantity),
        reason: form.reason || undefined,
      });
      toast.success('Stock actualizado correctamente');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar stock';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <div className="page"><div className="empty-state"><h3>Inicia sesion</h3><Link to="/login" className="btn accent" style={{ marginTop: '1rem' }}>Iniciar sesion</Link></div></div>;
  if (loading) return <Spinner />;

  return (
    <main className="page" role="main">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>Inventario</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Control de inventario</h1>
          <p className="section-subtitle">Gestiona el stock de tus productos con trazabilidad completa</p>
        </div>
      </div>

      {/* Alert Cards */}
      {alerts && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '1.5rem' }}>
          <StatsCard title="Total alertas" value={alerts.totalAlerts} subtitle="Requieren atencion" />
          <StatsCard title="Stock bajo" value={alerts.lowStock.count} subtitle="Menos de 5 unidades" />
          <StatsCard title="Sin stock" value={alerts.outOfStock.count} subtitle="Agotados" />
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', marginBottom: '1rem' }}>
        <button className={`btn ${tab === 'summary' ? 'accent' : 'secondary'}`} style={{ fontSize: '0.85rem' }} onClick={() => setTab('summary')}>
          Resumen por producto
        </button>
        <button className={`btn ${tab === 'products' ? 'accent' : 'secondary'}`} style={{ fontSize: '0.85rem' }} onClick={() => setTab('products')}>
          Ajustar stock
        </button>
        <button className={`btn ${tab === 'movements' ? 'accent' : 'secondary'}`} style={{ fontSize: '0.85rem' }} onClick={() => setTab('movements')}>
          Movimientos recientes
        </button>
      </div>

      {/* Inventory Summary Tab */}
      {tab === 'summary' && (
        <section className="section">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <Table
              columns={[
                { key: 'product', label: 'Producto', render: (r) => (
                  <span style={{ fontWeight: 500 }}>{r.product?.title || r.title || '-'}</span>
                )},
                { key: 'entries', label: 'Entradas', render: (r) => (
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>+{r.totalEntries || 0}</span>
                )},
                { key: 'exits', label: 'Salidas', render: (r) => (
                  <span style={{ color: 'var(--error)', fontWeight: 600 }}>-{r.totalExits || r.soldCount || 0}</span>
                )},
                { key: 'stock', label: 'En stock', render: (r) => (
                  <span style={{ fontWeight: 700, color: (r.currentStock || r.stock || 0) === 0 ? 'var(--error)' : (r.currentStock || r.stock || 0) <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                    {r.currentStock ?? r.stock ?? 0}
                  </span>
                )},
                { key: 'sold', label: 'Vendidos', render: (r) => r.soldCount || 0 },
                { key: 'history', label: 'Trazabilidad', render: (r) => (
                  <button className="btn secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => openHistory(r)}>
                    Ver historial
                  </button>
                )},
              ]}
              data={inventorySummary.length > 0 ? inventorySummary : products.map((p) => ({ ...p, currentStock: p.stock, totalEntries: 0, totalExits: p.soldCount || 0 }))}
              emptyMessage="Sin productos"
            />
          </div>
        </section>
      )}

      {/* Products Stock Tab */}
      {tab === 'products' && (
        <section className="section">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <Table
              columns={[
                { key: 'title', label: 'Producto', render: (r) => <span style={{ fontWeight: 500 }}>{r.title}</span> },
                { key: 'category', label: 'Categoria', render: (r) => <span className="pill accent">{r.category}</span> },
                { key: 'stock', label: 'Stock', render: (r) => (
                  <span style={{ fontWeight: 600, color: r.stock === 0 ? 'var(--error)' : r.stock <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                    {r.stock}
                  </span>
                )},
                { key: 'price', label: 'Precio', render: (r) => `$${r.price}` },
                { key: 'actions', label: '', render: (r) => (
                  <button className="btn accent" style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }} onClick={() => openStockModal(r)}>
                    Ajustar stock
                  </button>
                )},
              ]}
              data={products}
              emptyMessage="Sin productos"
            />
          </div>
        </section>
      )}

      {/* Recent Movements Tab */}
      {tab === 'movements' && movements.length > 0 && (
        <section className="section">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <Table
              columns={[
                { key: 'product', label: 'Producto', render: (r) => <span style={{ fontWeight: 500 }}>{r.product?.title || '-'}</span> },
                { key: 'type', label: 'Tipo', render: (r) => {
                  const colors = {
                    entrada: { bg: 'var(--success-light, #e8f5e9)', color: 'var(--success, #4caf50)' },
                    salida: { bg: 'var(--error-light, #ffebee)', color: 'var(--error, #f44336)' },
                  };
                  const style = colors[r.type] || { bg: 'var(--info-light, #e3f2fd)', color: 'var(--info, #2196f3)' };
                  return (
                    <span style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: style.bg, color: style.color }}>
                      {r.type}
                    </span>
                  );
                }},
                { key: 'quantity', label: 'Cantidad' },
                { key: 'stock', label: 'Stock', render: (r) => (
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.previousStock} → {r.newStock}</span>
                )},
                { key: 'reason', label: 'Razon', render: (r) => <span className="muted">{r.reason || '-'}</span> },
              ]}
              data={movements}
            />
          </div>
        </section>
      )}

      {/* Stock Update Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Ajustar stock: ${selectedProduct?.title}`}>
        {selectedProduct && (
          <form onSubmit={handleUpdateStock} style={{ display: 'grid', gap: '1.25rem' }}>
            <p className="muted" style={{ margin: 0 }}>
              Stock actual: <strong style={{ color: 'var(--text)', fontSize: '1.1rem' }}>{selectedProduct.stock}</strong>
            </p>
            <label>
              Tipo de movimiento
              <select style={{ width: '100%', marginTop: '0.4rem' }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="entrada">Entrada (agregar)</option>
                <option value="salida">Salida (retirar)</option>
                <option value="ajuste">Ajuste (establecer cantidad exacta)</option>
              </select>
            </label>
            <label>
              {form.type === 'ajuste' ? 'Nuevo stock' : 'Cantidad'}
              <input type="number" min="1" style={{ width: '100%', marginTop: '0.4rem' }} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </label>
            <label>
              Razon (opcional)
              <input style={{ width: '100%', marginTop: '0.4rem' }} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ej: reposicion de proveedor" />
            </label>
            <button className="btn accent" style={{ marginTop: '0.25rem' }} disabled={submitting}>
              {submitting ? 'Actualizando...' : 'Actualizar stock'}
            </button>
          </form>
        )}
      </Modal>

      {/* Product History Modal */}
      <Modal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title={`Historial: ${selectedProduct?.product?.title || selectedProduct?.title || ''}`}>
        {historyLoading ? <Spinner /> : (
          productHistory.length > 0 ? (
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              <Table
                columns={[
                  { key: 'type', label: 'Tipo', render: (r) => {
                    const colors = { entrada: '#4caf50', salida: '#f44336', ajuste: '#2196f3' };
                    return <span style={{ fontWeight: 600, color: colors[r.type] || '#666' }}>{r.type}</span>;
                  }},
                  { key: 'quantity', label: 'Cantidad' },
                  { key: 'stock', label: 'Stock', render: (r) => (
                    <span style={{ fontFamily: 'monospace' }}>{r.previousStock} → {r.newStock}</span>
                  )},
                  { key: 'reason', label: 'Razon', render: (r) => r.reason || '-' },
                  { key: 'by', label: 'Por', render: (r) => r.performedBy?.name || '-' },
                ]}
                data={productHistory}
              />
            </div>
          ) : (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>Sin movimientos registrados para este producto</p>
          )
        )}
      </Modal>
    </main>
  );
}
