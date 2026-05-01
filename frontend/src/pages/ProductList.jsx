import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../ui/ProductCard';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';
import { CATEGORIES, categoryLabel } from '../lib/categories';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Más relevantes' },
  { value: 'bestsellers', label: 'Más vendidos' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'newest', label: 'Recién llegados' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const promo = params.get('promo') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const minRating = params.get('minRating') || '';
  const inStock = params.get('inStock') || '';
  const sort = params.get('sort') || 'relevance';
  const page = parseInt(params.get('page'), 10) || 1;

  const [priceDraft, setPriceDraft] = useState({ min: minPrice, max: maxPrice });
  useEffect(() => { setPriceDraft({ min: minPrice, max: maxPrice }); }, [minPrice, maxPrice]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .get('/products', {
        params: {
          category: category || undefined,
          search: search || undefined,
          isPromotion: promo ? 'true' : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          minRating: minRating || undefined,
          inStock: inStock === 'true' ? 'true' : undefined,
          sort: sort !== 'relevance' ? sort : undefined,
          page,
        },
      })
      .then(({ data }) => {
        setProducts(data.data || data);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [category, search, promo, minPrice, maxPrice, minRating, inStock, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (!loading && !error) {
      track('view_item_list', {
        category: category || (promo ? 'promociones' : 'todos'),
        item_count: products.length,
        sort,
      });
    }
  }, [loading, error, products.length, category, promo, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
    next.delete('page');
    setParams(next, { replace: false });
  };

  const togglePromo = () => updateParam('promo', promo ? '' : '1');
  const toggleInStock = () => updateParam('inStock', inStock === 'true' ? '' : 'true');

  const applyPrice = () => {
    const next = new URLSearchParams(params);
    if (priceDraft.min) next.set('minPrice', priceDraft.min); else next.delete('minPrice');
    if (priceDraft.max) next.set('maxPrice', priceDraft.max); else next.delete('maxPrice');
    next.delete('page');
    setParams(next, { replace: false });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    setParams(next);
  };

  const activeFilters = useMemo(() => {
    const list = [];
    if (category) list.push({ key: 'category', label: `Categoría: ${categoryLabel(category)}` });
    if (promo) list.push({ key: 'promo', label: 'En oferta' });
    if (minPrice) list.push({ key: 'minPrice', label: `Desde $${minPrice}` });
    if (maxPrice) list.push({ key: 'maxPrice', label: `Hasta $${maxPrice}` });
    if (minRating) list.push({ key: 'minRating', label: `${minRating}★ o más` });
    if (inStock === 'true') list.push({ key: 'inStock', label: 'Solo disponibles' });
    return list;
  }, [category, promo, minPrice, maxPrice, minRating, inStock]);

  const categoryName = categoryLabel(category);
  const seoTitle = promo
    ? 'Ofertas en artesanías'
    : category
      ? `${categoryName} artesanal`
      : 'Catálogo de artesanías';
  const seoDescription = promo
    ? 'Promociones especiales de artesanías hechas a mano en Colombia. Cerámica, tejidos, joyería y más.'
    : category
      ? `Descubre piezas únicas de ${categoryName.toLowerCase()} hechas a mano por artesanos colombianos.`
      : 'Explora más de 300 piezas artesanales hechas en Colombia. Cerámica, tejidos, joyería y mucho más, directo del taller.';

  const buildPageUrl = (p) => {
    const q = new URLSearchParams(params);
    q.set('page', p);
    return `/productos?${q.toString()}`;
  };

  return (
    <main className="page" role="main">
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={[categoryName, 'artesanía Colombia', 'productos artesanales', 'hecho a mano'].filter(Boolean)}
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Catálogo', url: '/productos' },
          ...(category ? [{ name: categoryName, url: `/productos?category=${category}` }] : []),
        ]}
      />
      <nav aria-label="Migas de pan" style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>
        {' / '}
        {category ? (
          <>
            <Link to="/productos" style={{ color: 'var(--text-secondary)' }}>Catálogo</Link>
            {' / '}
            <span style={{ color: 'var(--text)' }}>{categoryName}</span>
          </>
        ) : (
          <span style={{ color: 'var(--text)' }}>Catálogo</span>
        )}
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">
            {promo ? 'Ofertas especiales' : category ? `Categoría: ${categoryName}` : 'Catálogo completo'}
          </h1>
          <p className="section-subtitle">
            {pagination.total > 0
              ? `${pagination.total} ${pagination.total === 1 ? 'producto encontrado' : 'productos encontrados'}`
              : 'Explora nuestra colección de artesanías'
            }
          </p>
        </div>
        <div className="catalog-sort">
          <label htmlFor="sort-select" className="muted" style={{ fontSize: '0.85rem' }}>Ordenar por</label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value === 'relevance' ? '' : e.target.value)}
            className="select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="catalog-filters" aria-label="Filtros de catálogo">
        <div className="filter-group" role="group" aria-label="Categorías">
          <button
            type="button"
            className={`chip ${!category ? 'chip-active' : ''}`}
            onClick={() => updateParam('category', '')}
          >
            Todas
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`chip ${category === c.slug ? 'chip-active' : ''}`}
              onClick={() => updateParam('category', c.slug)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <div className="filter-block">
            <label className="filter-label">Precio</label>
            <div className="filter-price">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="Mín"
                value={priceDraft.min}
                onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value }))}
                onBlur={applyPrice}
                onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
                aria-label="Precio mínimo"
                className="input"
              />
              <span aria-hidden="true">—</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="Máx"
                value={priceDraft.max}
                onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value }))}
                onBlur={applyPrice}
                onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
                aria-label="Precio máximo"
                className="input"
              />
            </div>
          </div>

          <div className="filter-block">
            <label className="filter-label" htmlFor="rating-select">Valoración mínima</label>
            <select
              id="rating-select"
              value={minRating}
              onChange={(e) => updateParam('minRating', e.target.value)}
              className="select"
            >
              <option value="">Cualquiera</option>
              <option value="4.5">4.5★ o más</option>
              <option value="4">4★ o más</option>
              <option value="3">3★ o más</option>
            </select>
          </div>

          <div className="filter-block filter-toggles">
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={inStock === 'true'}
                onChange={toggleInStock}
              />
              Solo disponibles
            </label>
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={!!promo}
                onChange={togglePromo}
              />
              En oferta
            </label>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="active-filters" aria-label="Filtros activos">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                className="chip chip-removable"
                onClick={() => updateParam(f.key, '')}
                aria-label={`Quitar filtro ${f.label}`}
              >
                {f.label}
                <span aria-hidden="true" style={{ marginLeft: '0.4rem' }}>×</span>
              </button>
            ))}
            <button type="button" className="link-btn" onClick={clearFilters}>
              Limpiar todo
            </button>
          </div>
        )}
      </section>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState
          title="Error al cargar productos"
          message="No pudimos obtener el catálogo. Verifica tu conexión e intenta de nuevo."
          onRetry={fetchProducts}
          backTo="/"
          backLabel="Ir al inicio"
        />
      ) : (
        <>
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
              <p className="muted">Intenta con otros filtros o explora todo el catálogo</p>
              <button type="button" className="btn secondary" style={{ marginTop: '1rem' }} onClick={clearFilters}>
                Limpiar filtros
              </button>
            </div>
          )}

          {pagination.pages > 1 && (
            <nav className="pagination" aria-label="Paginación de productos">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  to={buildPageUrl(p)}
                  className={`btn ${p === pagination.page ? 'accent' : 'secondary'}`}
                  aria-current={p === pagination.page ? 'page' : undefined}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </main>
  );
}
