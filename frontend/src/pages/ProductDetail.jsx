import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useCart } from '../state/CartContext';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';

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
  const [submitting, setSubmitting] = useState(false);
  const { add } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/products/${id}`).then(({ data }) => setProduct(data)),
      api.get(`/products/${id}/reviews`).then(({ data }) => setReviews(data)),
    ])
      .catch(() => toast.error('Error al cargar el producto'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, form);
      setForm({ rating: 5, comment: '' });
      const { data } = await api.get(`/products/${id}/reviews`);
      setReviews(data);
      toast.success('Resena enviada correctamente');
    } catch {
      toast.error('Error al enviar la resena');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    add(product);
    toast.success('Producto agregado al carrito');
  };

  if (loading) return <Spinner />;
  if (!product) return <div className="page">Producto no encontrado</div>;

  const price = product.isPromotion ? product.promotionPrice : product.price;

  return (
    <main className="page" role="main">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>
        {' / '}
        <Link to="/productos" style={{ color: 'var(--text-secondary)' }}>Catalogo</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>{product.title}</span>
      </nav>

      <article className="product-detail">
        <img
          className="product-detail-img"
          src={product.images?.[0] || 'https://via.placeholder.com/600x500'}
          alt={product.title}
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
            <button className="btn accent" style={{ flex: 1, padding: '0.85rem' }} onClick={handleAddToCart} aria-label={`Agregar ${product.title} al carrito`}>
              Agregar al carrito
            </button>
            <Link className="btn secondary" style={{ padding: '0.85rem 1.5rem' }} to="/carrito">
              Ver carrito
            </Link>
          </div>

          <div className="trust-row">
            <div className="trust-item">
              <CheckIcon /> Envio seguro
            </div>
            <div className="trust-item">
              <CheckIcon /> Artesano verificado
            </div>
            <div className="trust-item">
              <CheckIcon /> Pieza original
            </div>
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
                <span className="review-rating">
                  <StarFill /> {r.rating}/5
                </span>
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
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      color: n <= form.rating ? 'var(--accent-dark)' : 'var(--border)',
                      transition: 'color 0.15s',
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
