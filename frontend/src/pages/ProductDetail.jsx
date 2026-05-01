import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useCart } from '../state/CartContext';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import Seo from '../lib/Seo';
import ProductCard from '../ui/ProductCard';
import { track } from '../lib/analytics';
import { PLACEHOLDER_IMG, handleImgError } from '../lib/productImage';
import { categoryLabel } from '../lib/categories';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'https://manoscreadoras.com';

const FAQ_ITEMS = [
  {
    q: '¿Cuánto tarda el envío?',
    a: 'Despachamos a todo Colombia. Las entregas en ciudades principales tardan entre 2 y 5 días hábiles. Otras zonas pueden tardar entre 5 y 8 días hábiles.',
  },
  {
    q: '¿Puedo devolver el producto si no me convence?',
    a: 'Sí. Tienes hasta 5 días hábiles desde la entrega para solicitar la devolución, siempre que la pieza no haya sido usada y conserve su empaque original.',
  },
  {
    q: '¿Cómo sé que la pieza es auténtica?',
    a: 'Cada producto es elaborado a mano por un artesano verificado por Manos Creadoras. No revendemos productos industriales ni importados.',
  },
  {
    q: '¿Cómo se realiza el pago?',
    a: 'Por ahora, los pedidos se confirman en la plataforma y el pago se coordina directamente con el equipo de soporte o el vendedor. Te contactaremos para acordar el método de pago disponible y confirmar los detalles de entrega.',
  },
];

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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const BENEFITS = [
  { title: 'Envío a todo el país', desc: '2 a 5 días hábiles', icon: '📦' },
  { title: 'Devolución 5 días', desc: 'Si no te convence', icon: '↩️' },
  { title: 'Pago coordinado', desc: 'Con el vendedor o soporte', icon: '🔒' },
  { title: 'Pieza auténtica', desc: 'Hecha a mano y verificada', icon: '✋' },
];

function formatPrice(value) {
  if (value === undefined || value === null) return '';
  const n = Number(value);
  if (Number.isNaN(n)) return `$${value}`;
  return `$${n.toLocaleString('es-CO')}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [artisanProfile, setArtisanProfile] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
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
    setActiveImage(0);
    setQuantity(1);
    Promise.all([
      api.get(`/products/${id}`).then(({ data }) => setProduct(data)),
      api.get(`/products/${id}/reviews`).then(({ data }) => setReviews(data)),
    ])
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  useEffect(() => {
    if (!product?.category) return;
    api
      .get('/products', { params: { category: product.category, limit: 8 } })
      .then(({ data }) => {
        const list = data.data || data || [];
        setRelated(list.filter((p) => p._id !== product._id).slice(0, 4));
      })
      .catch(() => setRelated([]));
  }, [product?._id, product?.category]);

  useEffect(() => {
    const userId = product?.artisan?._id;
    if (!userId) return;
    api
      .get(`/artisan-profiles/${userId}`)
      .then(({ data }) => setArtisanProfile(data || null))
      .catch(() => setArtisanProfile(null));
  }, [product?.artisan?._id]);

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
      toast.success('Reseña enviada correctamente');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al enviar la reseña';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      toast.error('Este producto está agotado');
      return;
    }
    const cartItem = items.find((i) => i.product._id === product._id);
    const currentQty = cartItem ? cartItem.quantity : 0;
    if (currentQty + quantity > product.stock) {
      toast.error(`Solo hay ${product.stock - currentQty} unidades disponibles`);
      return;
    }
    for (let i = 0; i < quantity; i += 1) add(product);
    const price = product.isPromotion && product.promotionPrice != null ? product.promotionPrice : product.price;
    track('add_to_cart', {
      item_id: product._id,
      item_name: product.title,
      value: price * quantity,
      currency: 'COP',
      quantity,
    });
    toast.success(`${quantity} ${quantity === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito`);
  };

  const images = useMemo(() => {
    if (!product) return [];
    const list = product.images?.length ? product.images : [PLACEHOLDER_IMG];
    return list;
  }, [product]);

  if (loading) return <Spinner />;
  if (error) return <div className="page"><ErrorState title="Error al cargar producto" message="No pudimos obtener la información del producto." onRetry={fetchProduct} backTo="/productos" backLabel="Volver al catálogo" /></div>;
  if (!product) return <div className="page"><ErrorState title="Producto no encontrado" message="El producto que buscas no existe o fue eliminado." backTo="/productos" backLabel="Volver al catálogo" /></div>;

  const price = product.isPromotion ? product.promotionPrice : product.price;
  const isOutOfStock = product.stock <= 0;
  const lowStock = !isOutOfStock && product.stock <= 5;
  const discountPct = product.isPromotion && product.price > 0
    ? Math.round((1 - product.promotionPrice / product.price) * 100)
    : 0;

  const categoryName = categoryLabel(product.category);
  const seoDescription = product.description?.slice(0, 160)
    || `Conoce ${product.title}, una pieza artesanal hecha a mano por ${product.artisan?.name || 'un artesano colombiano'} en Manos Creadoras.`;

  return (
    <main className="page" role="main">
      <Seo
        title={product.title}
        description={seoDescription}
        image={product.images?.[0]}
        type="product"
        jsonLd={buildProductJsonLd(product, reviews)}
        keywords={[categoryName, product.title, product.artisan?.name, 'artesanía Colombia', 'hecho a mano'].filter(Boolean)}
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Catálogo', url: '/productos' },
          ...(product.category ? [{ name: categoryName, url: `/productos?category=${product.category}` }] : []),
          { name: product.title, url: `/productos/${product._id}` },
        ]}
      />
      <nav aria-label="Migas de pan" style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>
        {' / '}
        <Link to="/productos" style={{ color: 'var(--text-secondary)' }}>Catálogo</Link>
        {product.category && (
          <>
            {' / '}
            <Link to={`/productos?category=${product.category}`} style={{ color: 'var(--text-secondary)' }}>{categoryName}</Link>
          </>
        )}
        {' / '}
        <span style={{ color: 'var(--text)' }}>{product.title}</span>
      </nav>

      <article className="product-detail">
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img
              src={images[activeImage]}
              alt={`${product.title} - imagen ${activeImage + 1}`}
              loading="eager"
              onError={handleImgError}
            />
            {discountPct > 0 && !isOutOfStock && (
              <span className="badge badge-discount" aria-label={`Descuento de ${discountPct} por ciento`}>
                -{discountPct}%
              </span>
            )}
            {isOutOfStock && (
              <span className="badge badge-danger" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>Agotado</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="product-gallery-thumbs" role="tablist" aria-label="Galería de imágenes">
              {images.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeImage}
                  className={`thumb ${idx === activeImage ? 'thumb-active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`Vista ${idx + 1}`} loading="lazy" onError={handleImgError} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="pill accent">{categoryName}</span>
          <h1>{product.title}</h1>
          <p className="muted" style={{ margin: '0 0 0.75rem' }}>
            Por <strong style={{ color: 'var(--text)' }}>{product.artisan?.name}</strong>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="rating" style={{ fontSize: '0.9rem' }}>
              <StarFill />
              {product.ratingAverage?.toFixed(1) || '0.0'}
            </span>
            <span className="muted">({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})</span>
            {(product.soldCount || 0) > 0 && (
              <span className="muted">· {product.soldCount} vendidos</span>
            )}
          </div>

          <div className="price-line" style={{ marginBottom: '0.5rem' }}>
            {product.isPromotion && <span className="price-old" style={{ fontSize: '1.1rem' }}>{formatPrice(product.price)}</span>}
            <span className="price-main" style={{ fontSize: '2rem' }}>{formatPrice(price)}</span>
            {discountPct > 0 && (
              <span className="badge badge-promo" style={{ fontSize: '0.75rem' }}>
                Ahorras {formatPrice(product.price - product.promotionPrice)}
              </span>
            )}
          </div>

          <div className="stock-line">
            {isOutOfStock ? (
              <span className="stock-badge stock-out">Sin existencias</span>
            ) : lowStock ? (
              <span className="stock-badge stock-low">¡Solo quedan {product.stock}!</span>
            ) : (
              <span className="stock-badge stock-ok">{product.stock} disponibles</span>
            )}
          </div>

          <p className="description">{product.description}</p>

          {!isOutOfStock && (
            <div className="qty-row">
              <label className="qty-label" htmlFor="qty-input">Cantidad</label>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                >−</button>
                <input
                  id="qty-input"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isNaN(n)) return;
                    setQuantity(Math.max(1, Math.min(product.stock, n)));
                  }}
                  aria-label="Cantidad"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  aria-label="Aumentar cantidad"
                >+</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn accent"
              style={{ flex: 1, minWidth: '180px', padding: '0.85rem' }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? 'Producto agotado' : `Agregar ${quantity} al carrito`}
            >
              {isOutOfStock ? 'Agotado' : `Agregar al carrito · ${formatPrice(price * quantity)}`}
            </button>
            <Link className="btn secondary" style={{ padding: '0.85rem 1.5rem' }} to="/carrito">
              Ver carrito
            </Link>
          </div>

          <div className="benefits-grid">
            {BENEFITS.map((b) => (
              <div key={b.title} className="benefit-item">
                <span className="benefit-icon" aria-hidden="true">{b.icon}</span>
                <div>
                  <strong>{b.title}</strong>
                  <span className="muted">{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Artisan card */}
      {(artisanProfile || product.artisan) && (
        <section className="section" aria-label="Sobre el artesano">
          <div className="artisan-card-wide">
            {artisanProfile?.coverImage && (
              <div className="artisan-cover" style={{ backgroundImage: `url(${artisanProfile.coverImage})` }} />
            )}
            <div className="artisan-card-body">
              {artisanProfile?.logo && (
                <img className="artisan-logo" src={artisanProfile.logo} alt={artisanProfile.businessName || product.artisan?.name} />
              )}
              <div style={{ flex: 1 }}>
                <p className="muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Conoce al artesano
                </p>
                <h3 style={{ margin: '0.25rem 0 0.5rem', fontFamily: "'Playfair Display', serif" }}>
                  {artisanProfile?.businessName || product.artisan?.name}
                </h3>
                {(artisanProfile?.craft || artisanProfile?.region) && (
                  <p className="muted" style={{ margin: '0 0 0.75rem' }}>
                    {[artisanProfile?.craft, artisanProfile?.region].filter(Boolean).join(' · ')}
                  </p>
                )}
                {artisanProfile?.story && (
                  <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {artisanProfile.story.length > 240 ? `${artisanProfile.story.slice(0, 240)}…` : artisanProfile.story}
                  </p>
                )}
                {artisanProfile?.slug ? (
                  <Link className="btn secondary" to={`/artesanos/${artisanProfile.slug}`}>
                    Ver perfil del artesano
                  </Link>
                ) : (
                  <Link className="btn secondary" to={`/productos?artisan=${product.artisan?._id || ''}`}>
                    Ver más productos del artesano
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cross-sell */}
      {related.length > 0 && (
        <section className="section" aria-label="Productos relacionados">
          <div className="section-header">
            <div>
              <h2 className="section-title">También te puede gustar</h2>
              <p className="section-subtitle">Más piezas en {categoryName}</p>
            </div>
            <Link to={`/productos?category=${product.category}`} className="link-btn">
              Ver todo en {categoryName}
            </Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="section" aria-label="Preguntas frecuentes">
        <div className="section-header">
          <div>
            <h2 className="section-title">Preguntas frecuentes</h2>
            <p className="section-subtitle">Resolvemos las dudas más comunes</p>
          </div>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className={`faq-item ${isOpen ? 'faq-open' : ''}`}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <ChevronIcon open={isOpen} />
                </button>
                {isOpen && <div className="faq-a">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      <section className="section" aria-label="Reseñas del producto">
        <div className="section-header">
          <div>
            <h2 className="section-title">Reseñas verificadas</h2>
            <p className="section-subtitle">{reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'} de compradores reales</p>
          </div>
          {reviews.length > 0 && (
            <div className="rating-summary">
              <span className="rating-summary-num">{product.ratingAverage?.toFixed(1) || '0.0'}</span>
              <div>
                <div className="rating-stars" aria-hidden="true">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} style={{ color: n <= Math.round(product.ratingAverage || 0) ? 'var(--accent-dark)' : 'var(--border)' }}>
                      <StarFill />
                    </span>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: '0.82rem' }}>
                  Basado en {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {reviews.map((r) => (
            <div key={r._id} className="review-card">
              <div className="review-header">
                <span className="review-author">
                  <CheckIcon /> {r.buyer?.name}
                </span>
                <span className="review-rating"><StarFill /> {r.rating}/5</span>
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p className="muted">Aún no hay reseñas para este producto. Sé el primero en opinar.</p>
            </div>
          )}
        </div>
      </section>

      {/* Review Form */}
      {user?.role === 'buyer' && (
        <section className="section" aria-label="Escribir reseña">
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Comparte tu experiencia</h3>
          <form className="card" onSubmit={submitReview} style={{ display: 'grid', gap: '1.25rem', marginTop: '1rem', maxWidth: 560 }}>
            <label htmlFor="rating">
              Calificación
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
              Tu opinión
              <textarea
                id="comment"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Cuenta cómo fue tu experiencia con este producto..."
                style={{ minHeight: '120px', width: '100%', marginTop: '0.4rem', resize: 'vertical' }}
              />
            </label>
            <button className="btn accent" style={{ width: 'fit-content' }} disabled={submitting}>
              {submitting ? 'Enviando...' : 'Publicar reseña'}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
