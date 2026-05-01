import { Link } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import { useToast } from './Toast';
import { getProductImage, handleImgError } from '../lib/productImage';
import { categoryLabel } from '../lib/categories';

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

const NEW_DAYS = 30;
const LOW_STOCK_THRESHOLD = 3;
const BESTSELLER_MIN = 10;
const TOP_RATED_MIN = 4.5;

function getBadges(product, isOutOfStock) {
  const badges = [];
  if (product.isPromotion) badges.push({ label: 'Oferta', kind: 'promo' });
  if (isOutOfStock) {
    badges.push({ label: 'Agotado', kind: 'danger' });
    return badges;
  }
  if (product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD) {
    badges.push({ label: `Quedan ${product.stock}`, kind: 'warning' });
  }
  if ((product.soldCount || 0) >= BESTSELLER_MIN) {
    badges.push({ label: 'Más vendido', kind: 'accent' });
  }
  if ((product.ratingAverage || 0) >= TOP_RATED_MIN) {
    badges.push({ label: 'Top valorado', kind: 'success' });
  }
  if (product.createdAt) {
    const ageDays = (Date.now() - new Date(product.createdAt).getTime()) / 86400000;
    if (ageDays >= 0 && ageDays <= NEW_DAYS) {
      badges.push({ label: 'Nuevo', kind: 'info' });
    }
  }
  return badges;
}

function formatPrice(value) {
  if (value === undefined || value === null) return '';
  const n = Number(value);
  if (Number.isNaN(n)) return `$${value}`;
  return `$${n.toLocaleString('es-CO')}`;
}

export default function ProductCard({ product }) {
  const { add, items } = useCart();
  const toast = useToast();
  const price = product.isPromotion ? product.promotionPrice : product.price;
  const isOutOfStock = product.stock <= 0;
  const badges = getBadges(product, isOutOfStock);

  const discountPct = product.isPromotion && product.price > 0
    ? Math.round(((product.price - (product.promotionPrice || 0)) / product.price) * 100)
    : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error('Este producto está agotado');
      return;
    }
    const cartItem = items.find((i) => i.product._id === product._id);
    const currentQty = cartItem ? cartItem.quantity : 0;
    if (currentQty >= product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }
    add(product);
    toast.success(`${product.title} agregado al carrito`);
  };

  return (
    <article className="product-card" style={{ opacity: isOutOfStock ? 0.7 : 1 }}>
      <div className="product-img-wrap">
        <img
          src={getProductImage(product)}
          alt={`${product.title} - artesanía de ${categoryLabel(product.category) || 'la categoría'}`}
          loading="lazy"
          onError={handleImgError}
        />
        {badges.length > 0 && (
          <div className="badge-stack">
            {badges.map((b, idx) => (
              <span key={`${b.kind}-${idx}`} className={`badge badge-${b.kind}`}>{b.label}</span>
            ))}
          </div>
        )}
        {discountPct > 0 && !isOutOfStock && (
          <span className="badge badge-discount" aria-label={`Descuento de ${discountPct} por ciento`}>
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span className="pill accent">{categoryLabel(product.category) || 'Artesanía'}</span>
          <span>{product.artisan?.name || 'Artesano'}</span>
        </div>
        <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '0.95rem', fontWeight: 600 }}>{product.title}</h4>
        <div className="price-line">
          {product.isPromotion && <span className="price-old">{formatPrice(product.price)}</span>}
          <span className="price-main">{formatPrice(price)}</span>
        </div>
        <div className="product-meta" style={{ marginTop: '0.5rem' }}>
          <span className="rating">
            <StarIcon />
            {product.ratingAverage?.toFixed(1) || '0.0'}
          </span>
          <span>{product.soldCount || 0} vendidos</span>
        </div>
      </div>
      <div className="product-actions">
        <Link className="btn secondary" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }} to={`/productos/${product._id}`}>
          Ver detalle
        </Link>
        <button
          className="btn accent"
          style={{ flex: 1, fontSize: '0.85rem', opacity: isOutOfStock ? 0.5 : 1 }}
          onClick={handleAdd}
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? `${product.title} agotado` : `Agregar ${product.title} al carrito`}
        >
          {isOutOfStock ? 'Agotado' : 'Agregar'}
        </button>
      </div>
    </article>
  );
}
