import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../ui/ProductCard';
import Spinner from '../ui/Spinner';
import { useToast } from '../ui/Toast';

export default function ProductList() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const promo = params.get('promo') || '';
  const page = parseInt(params.get('page'), 10) || 1;

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { category, search, isPromotion: promo ? 'true' : undefined, page } })
      .then(({ data }) => {
        setProducts(data.data || data);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch(() => toast.error('Error al cargar los productos'))
      .finally(() => setLoading(false));
  }, [category, search, promo, page]);

  if (loading) return <Spinner />;

  return (
    <main className="page" role="main">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>Catalogo</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">
            {promo ? 'Ofertas especiales' : category ? `Categoria: ${category}` : 'Catalogo completo'}
          </h1>
          <p className="section-subtitle">
            {pagination.total > 0
              ? `${pagination.total} productos encontrados`
              : 'Explora nuestra coleccion de artesanias'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {promo && <span className="pill promo">En promocion</span>}
          {category && <span className="pill accent">{category}</span>}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <h3>No encontramos productos</h3>
          <p className="muted">Intenta con otros filtros o explora todo el catalogo</p>
          <Link to="/productos" className="btn secondary" style={{ marginTop: '1rem' }}>
            Ver todo el catalogo
          </Link>
        </div>
      )}

      {pagination.pages > 1 && (
        <nav className="pagination" aria-label="Paginacion de productos">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/productos?${new URLSearchParams({ ...(category && { category }), ...(search && { search }), ...(promo && { promo }), page: p }).toString()}`}
              className={`btn ${p === pagination.page ? 'accent' : 'secondary'}`}
              aria-current={p === pagination.page ? 'page' : undefined}
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </main>
  );
}
