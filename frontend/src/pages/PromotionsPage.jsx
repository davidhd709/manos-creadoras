import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import Modal from '../components/Modal';

export default function PromotionsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [promoPrice, setPromoPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    api.get(`/products?artisan=${user?.userId || user?._id}&limit=50`)
      .then(({ data }) => setProducts(data.data || data))
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) fetchProducts(); }, [user]);

  const togglePromotion = async (product) => {
    if (product.isPromotion) {
      // Desactivar promocion
      try {
        await api.put(`/products/${product._id}`, { isPromotion: false });
        toast.success('Promocion desactivada');
        fetchProducts();
      } catch (err) {
        toast.error('Error al desactivar promocion');
      }
    } else {
      // Abrir modal para definir precio
      setSelected(product);
      setPromoPrice('');
      setModalOpen(true);
    }
  };

  const activatePromotion = async (e) => {
    e.preventDefault();
    if (!promoPrice || Number(promoPrice) >= selected.price) {
      toast.error('El precio de promocion debe ser menor al precio original');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/products/${selected._id}`, {
        isPromotion: true,
        promotionPrice: Number(promoPrice),
      });
      toast.success('Promocion activada');
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Error al activar promocion');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  const activePromos = products.filter((p) => p.isPromotion);
  const inactivePromos = products.filter((p) => !p.isPromotion);

  return (
    <main className="page" role="main">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>Promociones</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Gestionar promociones</h1>
          <p className="section-subtitle">{activePromos.length} promocion(es) activa(s) de {products.length} producto(s)</p>
        </div>
      </div>

      {/* Active Promotions */}
      {activePromos.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Promociones activas</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {activePromos.map((p) => {
              const discount = Math.round((1 - p.promotionPrice / p.price) * 100);
              return (
                <div key={p._id} className="card" style={{ padding: '1.25rem', position: 'relative' }}>
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'var(--error)', color: 'white',
                    padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                  }}>-{discount}%</span>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{p.title}</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>${p.price}</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--error)' }}>${p.promotionPrice}</span>
                  </div>
                  <p className="muted" style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>Stock: {p.stock} | Vendidos: {p.soldCount || 0}</p>
                  <button className="btn secondary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => togglePromotion(p)}>
                    Desactivar promocion
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Products without promotion */}
      <section className="section">
        <h2 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Productos sin promocion</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {inactivePromos.map((p) => (
            <div key={p._id} className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{p.title}</h3>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>${p.price}</p>
              <p className="muted" style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>Stock: {p.stock} | Vendidos: {p.soldCount || 0}</p>
              <button className="btn accent" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => togglePromotion(p)}>
                Activar promocion
              </button>
            </div>
          ))}
          {inactivePromos.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <h3>Todos tus productos tienen promocion</h3>
            </div>
          )}
        </div>
      </section>

      {/* Promo Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Crear promocion: ${selected?.title}`}>
        {selected && (
          <form onSubmit={activatePromotion} style={{ display: 'grid', gap: '1.25rem' }}>
            <p className="muted" style={{ margin: 0 }}>
              Precio original: <strong style={{ color: 'var(--text)', fontSize: '1.1rem' }}>${selected.price}</strong>
            </p>
            <label>
              Precio de promocion
              <input
                type="number"
                min="1"
                max={selected.price - 1}
                style={{ width: '100%', marginTop: '0.4rem' }}
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                required
                placeholder={`Menor a $${selected.price}`}
              />
            </label>
            {promoPrice && Number(promoPrice) < selected.price && (
              <p style={{ margin: 0, color: 'var(--success)', fontWeight: 600 }}>
                Descuento: {Math.round((1 - Number(promoPrice) / selected.price) * 100)}%
              </p>
            )}
            <button className="btn accent" disabled={submitting}>
              {submitting ? 'Activando...' : 'Activar promocion'}
            </button>
          </form>
        )}
      </Modal>
    </main>
  );
}
