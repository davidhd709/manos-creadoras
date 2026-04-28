import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../ui/ProductCard';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';
import ArtisanSpotlight from '../components/ArtisanSpotlight';
import Testimonials from '../components/Testimonials';

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

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [top, setTop] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      api.get('/banners').then(({ data }) => setBanners(data)),
      api.get('/products/top').then(({ data }) => setTop(data)),
      api.get('/metrics/public').then(({ data }) => setMetrics(data)).catch(() => setMetrics(null)),
    ])
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { track('view_home'); }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="page"><ErrorState title="Error al cargar" message="No pudimos cargar la pagina principal. Verifica tu conexion." onRetry={fetchData} /></div>;

  const showcase = shuffle(top).slice(0, 3);
  const showStats = metrics?.hasMinimumScale;

  return (
    <main role="main">
      <Seo
        title="Marketplace de artesanías hechas en Colombia"
        description="Descubre piezas únicas hechas a mano por artesanos colombianos. Cerámica, tejidos, joyería y mucho más, directo del taller a tu casa."
      />
      {/* HERO */}
      <section className="hero-full" aria-label="Bienvenida">
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
              Arte hecho en Colombia,<br />
              directo del <em>taller a tu casa</em>
            </h1>

            <p className="hero-desc">
              Mochilas wayuu, ceramica de Raquira, joyeria en filigrana y mucho mas.
              Compra directo al artesano y apoya el trabajo manual de nuestras regiones.
            </p>

            <div className="hero-actions">
              <Link className="hero-cta" to="/productos" onClick={() => track('cta_home_clicked', { placement: 'hero', target: 'catalog' })}>
                Explorar catalogo
                <ArrowRight />
              </Link>
              <Link className="hero-cta-ghost" to="/vende" onClick={() => track('cta_sell_clicked', { placement: 'hero' })}>
                Vender en Manos Creadoras
              </Link>
            </div>

            {showStats ? (
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-value">{metrics.artisans}+</span>
                  <span className="hero-stat-label">Artesanos verificados</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-value">{metrics.products}+</span>
                  <span className="hero-stat-label">Piezas unicas</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-value">{metrics.orders}+</span>
                  <span className="hero-stat-label">Pedidos atendidos</span>
                </div>
              </div>
            ) : (
              <div className="hero-tag" style={{ marginTop: '1.5rem' }}>
                <span className="hero-tag-dot" />
                Beta abierta — primeros artesanos onboarding
              </div>
            )}
          </div>

          <div className="hero-showcase">
            <div className="showcase-stack">
              {showcase.map((p, i) => (
                <Link to={`/productos/${p._id}`} key={p._id} className="showcase-card" style={{ '--i': i }}>
                  <img src={p.images?.[0] || 'https://via.placeholder.com/300x300'} alt={`${p.title} - artesania`} loading="lazy" />
                  <div className="showcase-card-info">
                    <span className="showcase-card-title">{p.title}</span>
                    <span className="showcase-card-price">${p.isPromotion ? p.promotionPrice : p.price}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="showcase-ring" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="page" style={{ paddingTop: '0.5rem', paddingBottom: 0 }}>
        <div className="trust-bar">
          <div className="trust-item-bar">
            <div className="trust-icon"><ShieldIcon /></div>
            <div><strong>Compra segura</strong><span>Proteccion al comprador</span></div>
          </div>
          <div className="trust-item-bar">
            <div className="trust-icon"><TruckIcon /></div>
            <div><strong>Envio rapido</strong><span>Entrega en 3-5 dias</span></div>
          </div>
          <div className="trust-item-bar">
            <div className="trust-icon"><HeartIcon /></div>
            <div><strong>Comercio justo</strong><span>Apoyo directo al artesano</span></div>
          </div>
          <div className="trust-item-bar">
            <div className="trust-icon"><StarIcon /></div>
            <div><strong>Calidad garantizada</strong><span>Artesanos verificados</span></div>
          </div>
        </div>
      </div>

      {/* BANNERS */}
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
                  <img src={b.imageUrl} alt={`Promocion: ${b.title}`} className="promo-card-img" loading="lazy" />
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

      {/* CATEGORIES */}
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

        {/* TOP PRODUCTS */}
        <section className="section" aria-label="Productos mas vendidos">
          <div className="section-header">
            <div>
              <h2 className="section-title">Los mas vendidos</h2>
              <p className="section-subtitle">Seleccion curada por demanda y valoraciones</p>
            </div>
            <Link to="/productos" className="btn secondary">Ver todo</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {top.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>

        <ArtisanSpotlight />

        <Testimonials />

        {/* CTA artesanos */}
        <section className="section" aria-label="Vende en Manos Creadoras">
          <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-light), var(--bg-warm))' }}>
            <h2 style={{ margin: '0 0 0.5rem' }}>¿Eres artesano? Tu vitrina te espera</h2>
            <p className="muted" style={{ margin: '0 0 1.25rem' }}>
              0% comision los primeros 3 meses. Aprobacion en menos de 24 horas.
            </p>
            <Link
              to="/vende"
              className="btn accent"
              style={{ padding: '0.85rem 2rem' }}
              onClick={() => track('cta_sell_clicked', { placement: 'home_bottom' })}
            >
              Vender en Manos Creadoras
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
