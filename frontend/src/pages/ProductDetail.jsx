import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useCart } from '../state/CartContext';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'https://manoscreadoras.com';

function buildProductJsonLd(product, reviews) {
  const price = product.isPromotion && product.promotionPrice != null ? product.promotionPrice : product.price;
  const url = `${PUBLIC_URL}/productos/${product._id}`;
  const lastReviews = (reviews || []).slice(0, 5).map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.buyer?.name || 'Comprador' },
    reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.comment,
  }));
  const aggregate = product.ratingAverage && reviews?.length
    ? {
      '@type': 'AggregateRating',
      ratingValue: Number(product.ratingAverage).toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
    }
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.length ? product.images : undefined,
    sku: product._id,
    category: product.category,
    brand: product.artisan?.name ? { '@type': 'Brand', name: product.artisan.name } : undefined,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'COP',
      price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: aggregate,
    review: lastReviews.length ? lastReviews : undefined,
  };
}

const StarFill = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { add, items } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const fetchProduct = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      api.get(`/products/${id}`).then(({ data }) => setProduct(data)),
      api.get(`/products/${id}/reviews`).then(({ data }) => setReviews(data)),
    ])
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  useEffect(() => {
    if (product?._id) {
      const price = product.isPromotion && product.promotionPrice != null ? product.promotionPrice : product.price;
      track('view_item', {
        item_id: product._id,
        item_name: product.title,
        price,
        currency: 'COP',
        category: product.category,
        artisan_id: product.artisan?._id,
      });
    }
  }, [product]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, form);
      setForm({ rating: 5, comment: '' });
      const { data } = await api.get(`/products/${id}/reviews`);
      setReviews(data);
      toast.success('Resena enviada correctamente');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al enviar la resena';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Este producto esta agotado');
      return;
    }
    const cartItem = items.find((i) => i.product._id === product._id);
    const currentQty = cartItem ? cartItem.quantity : 0;
    if (currentQty >= product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }
    add(product);
    const price = product.isPromotion && product.promotionPrice != null ? product.promotionPrice : product.price;
    track('add_to_cart', {
      item_id: product._id,
      item_name: product.title,
      value: price,
      currency: 'COP',
      quantity: 1,
    });
    toast.success('Producto agregado al carrito');
  };

  if (loading) return <Spinner />;
  if (error) return <div className="page"><ErrorState title="Error al cargar producto" message="No pudimos obtener la informacion del producto." onRetry={fetchProduct} backTo="/productos" backLabel="Volver al catalogo" /></div>;
  if (!product) return <div className="page"><ErrorState title="Producto no encontrado" message="El producto que buscas no existe o fue eliminado." backTo="/productos" backLabel="Volver al catalogo" /></div>;

  const price = product.isPromotion ? product.promotionPrice : product.price;
  const isOutOfStock = product.stock <= 0;

  const seoDescription = product.description?.slice(0, 160) || `Conoce ${product.title}, una pieza artesanal hecha a mano por ${product.artisan?.name || 'un artesano colombiano'} en Manos Creadoras.`;

  return (
    <main className="page" role="main">
      <Seo
        title={product.title}
        description={seoDescription}
        image={product.images?.[0]}
        type="product"
        jsonLd={buildProductJsonLd(product, reviews)}
      />
      <nav aria-label="Migas de pan" style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>
        {' / '}
        <Link to="/productos" style={{ color: 'var(--text-secondary)' }}>Catalogo</Link>
        {product.category && (
          <>
            {' / '}
            <Link to={`/productos?category=${product.category}`} style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{product.category}</Link>
          </>
        )}
        {' / '}
        <span style={{ color: 'var(--text)' }}>{product.title}</span>
      </nav>

      <article className="product-detail">
        <img
          className="product-detail-img"
          src={product.images?.[0] || 'https://via.placeholder.com/600x500'}
          alt={`${product.title} - artesania de ${product.category}`}
          loading="lazy"
        />
        <div className="product-detail-info">
          <span className="pill accent">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="muted" style={{ margin: '0 0 0.75rem' }}>
            Por <strong style={{ color: 'var(--text)' }}>{product.artisan?.name}</strong>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="rating" style={{ fontSize: '0.9rem' }}>
              <StarFill />
              {product.ratingAverage?.toFixed(1) || '0.0'}
            </span>
            <span className="muted">({reviews.length} resenas)</span>
            {isOutOfStock ? (
              <span className="pill" style={{ background: 'var(--error)', color: '#fff', fontSize: '0.75rem' }}>Agotado</span>
            ) : product.stock <= 5 ? (
              <span className="pill" style={{ background: 'var(--warning)', color: '#fff', fontSize: '0.75rem' }}>Quedan {product.stock}</span>
            ) : null}
          </div>

          <div className="price-line" style={{ marginBottom: '1rem' }}>
            {product.isPromotion && <span className="price-old" style={{ fontSize: '1.1rem' }}>${product.price}</span>}
            <span className="price-main" style={{ fontSize: '2rem' }}>${price}</span>
            {product.isPromotion && (
              <span className="pill promo" style={{ fontSize: '0.75rem' }}>
                -{Math.round((1 - product.promotionPrice / product.price) * 100)}%
              </span>
            )}
          </div>

          <p className="description">{product.description}</p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="btn accent"
              style={{ flex: 1, padding: '0.85rem', opacity: isOutOfStock ? 0.5 : 1 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? 'Producto agotado' : `Agregar ${product.title} al carrito`}
            >
              {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
            </button>
            <Link className="btn secondary" style={{ padding: '0.85rem 1.5rem' }} to="/carrito">
              Ver carrito
            </Link>
          </div>

          <div className="trust-row">
            <div className="trust-item"><CheckIcon /> Envio seguro</div>
            <div className="trust-item"><CheckIcon /> Artesano verificado</div>
            <div className="trust-item"><CheckIcon /> Pieza original</div>
          </div>
        </div>
      </article>

      {/* Reviews */}
      <section className="section" aria-label="Resenas del producto">
        <div className="section-header">
          <div>
            <h2 className="section-title">Resenas</h2>
            <p className="section-subtitle">{reviews.length} opiniones de compradores</p>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {reviews.map((r) => (
            <div key={r._id} className="review-card">
              <div className="review-header">
                <span className="review-author">{r.buyer?.name}</span>
                <span className="review-rating"><StarFill /> {r.rating}/5</span>
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p className="muted">Aun no hay resenas para este producto. Se el primero en opinar.</p>
            </div>
          )}
        </div>
      </section>

      {/* Review Form */}
      {user?.role === 'buyer' && (
        <section className="section" aria-label="Escribir resena">
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Comparte tu experiencia</h3>
          <form className="card" onSubmit={submitReview} style={{ display: 'grid', gap: '1.25rem', marginTop: '1rem', maxWidth: 560 }}>
            <label htmlFor="rating">
              Calificacion
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                      color: n <= form.rating ? 'var(--accent-dark)' : 'var(--border)', transition: 'color 0.15s',
                    }}
                    aria-label={`${n} estrellas`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                  </button>
                ))}
              </div>
            </label>
            <label htmlFor="comment">
              Tu opinion
              <textarea
                id="comment"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Cuenta como fue tu experiencia con este producto..."
                style={{ minHeight: '120px', width: '100%', marginTop: '0.4rem', resize: 'vertical' }}
              />
            </label>
            <button className="btn accent" style={{ width: 'fit-content' }} disabled={submitting}>
              {submitting ? 'Enviando...' : 'Publicar resena'}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
