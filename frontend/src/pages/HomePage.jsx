import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../ui/ProductCard';
import Spinner from '../ui/Spinner';
import { useToast } from '../ui/Toast';

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);

const TruckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const CATEGORIES = [
  { name: 'Ceramica', icon: '🏺', slug: 'ceramica' },
  { name: 'Tejidos', icon: '🧶', slug: 'tejidos' },
  { name: 'Joyeria', icon: '💍', slug: 'joyeria' },
  { name: 'Madera', icon: '🪵', slug: 'madera' },
  { name: 'Pintura', icon: '🎨', slug: 'pintura' },
  { name: 'Cuero', icon: '👜', slug: 'cuero' },
  { name: 'Vidrio', icon: '🫙', slug: 'vidrio' },
  { name: 'Metal', icon: '⚒️', slug: 'metal' },
];

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.get('/banners').then(({ data }) => setBanners(data)),
      api.get('/products/top').then(({ data }) => setTop(data)),
    ])
      .catch(() => toast.error('Error al cargar la pagina principal'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  // Shuffle and take 3 random products for the hero showcase
  const showcase = [...top].sort(() => Math.random() - 0.5).slice(0, 3);

  return (
    <main role="main">
      {/* ══ HERO ══ */}
      <section className="hero-full" aria-label="Bienvenida">
        {/* Decorative elements */}
        <div className="hero-bg-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-1" aria-hidden="true" />
        <div className="hero-glow hero-glow-2" aria-hidden="true" />

        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-tag">
              <span className="hero-tag-dot" />
              Marketplace artesanal
            </span>

            <h1 className="hero-title">
              Arte hecho a mano,<br />
              directo del <em>artesano</em>
            </h1>

            <p className="hero-desc">
              Mas de 2,500 piezas unicas de ceramica, tejidos, joyeria y madera.
              Cada compra apoya directamente a artesanos de Latinoamerica.
            </p>

            <div className="hero-actions">
              <Link className="hero-cta" to="/productos">
                Explorar catalogo
                <ArrowRight />
              </Link>
              <Link className="hero-cta-ghost" to="/productos?promo=true">
                Ver ofertas
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">120+</span>
                <span className="hero-stat-label">Artesanos</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">2,500+</span>
                <span className="hero-stat-label">Piezas</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">4.9</span>
                <span className="hero-stat-label">Rating</span>
              </div>
            </div>
          </div>

          {/* Floating product showcase */}
          <div className="hero-showcase">
            <div className="showcase-stack">
              {showcase.map((p, i) => (
                <Link
                  to={`/productos/${p._id}`}
                  key={p._id}
                  className="showcase-card"
                  style={{ '--i': i }}
                >
                  <img
                    src={p.images?.[0] || 'https://via.placeholder.com/300x300'}
                    alt={p.title}
                  />
                  <div className="showcase-card-info">
                    <span className="showcase-card-title">{p.title}</span>
                    <span className="showcase-card-price">${p.isPromotion ? p.promotionPrice : p.price}</span>
                  </div>
                </Link>
              ))}
            </div>
            {/* Decorative ring */}
            <div className="showcase-ring" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ══ TRUST BAR ══ */}
      <div className="page" style={{ paddingTop: '0.5rem', paddingBottom: 0 }}>
        <div className="trust-bar">
          <div className="trust-item-bar">
            <div className="trust-icon"><ShieldIcon /></div>
            <div>
              <strong>Compra segura</strong>
              <span>Proteccion al comprador</span>
            </div>
          </div>
          <div className="trust-item-bar">
            <div className="trust-icon"><TruckIcon /></div>
            <div>
              <strong>Envio rapido</strong>
              <span>Entrega en 3-5 dias</span>
            </div>
          </div>
          <div className="trust-item-bar">
            <div className="trust-icon"><HeartIcon /></div>
            <div>
              <strong>Comercio justo</strong>
              <span>Apoyo directo al artesano</span>
            </div>
          </div>
          <div className="trust-item-bar">
            <div className="trust-icon"><StarIcon /></div>
            <div>
              <strong>Calidad garantizada</strong>
              <span>Artesanos verificados</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BANNERS / PROMOS ══ */}
      {banners.length > 0 && (
        <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <section className="section" aria-label="Promociones">
            <div className="section-header">
              <div>
                <h2 className="section-title">Destacados</h2>
                <p className="section-subtitle">Promociones y novedades del marketplace</p>
              </div>
            </div>
            <div className="promo-grid">
              {banners.slice(0, 4).map((b) => (
                <div key={b._id} className="promo-card">
                  <img src={b.imageUrl} alt={b.title} className="promo-card-img" />
                  <div className="promo-card-overlay">
                    <h4 className="promo-card-title">{b.title}</h4>
                    <p className="promo-card-desc">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ══ CATEGORIES ══ */}
      <div className="page" style={{ paddingTop: 0 }}>
        <section className="section" style={{ marginTop: '1.5rem' }} aria-label="Categorias">
          <div className="section-header">
            <div>
              <h2 className="section-title">Explora por categoria</h2>
              <p className="section-subtitle">Encuentra exactamente lo que buscas</p>
            </div>
          </div>
          <div className="categories-strip">
            {CATEGORIES.map((cat) => (
              <Link to={`/productos?category=${cat.slug}`} key={cat.slug} className="category-chip">
                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ TOP PRODUCTS ══ */}
        <section className="section" aria-label="Productos mas vendidos">
          <div className="section-header">
            <div>
              <h2 className="section-title">Los mas vendidos</h2>
              <p className="section-subtitle">Seleccion curada por demanda y valoraciones</p>
            </div>
            <Link to="/productos" className="btn secondary">
              Ver todo
            </Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {top.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
