import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import ProductCard from '../ui/ProductCard';
import Seo from '../lib/Seo';
import { useToast } from '../ui/Toast';
import { track } from '../lib/analytics';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'https://manoscreadoras.com';

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);

function buildPersonJsonLd(profile, user, products) {
  const url = `${PUBLIC_URL}/artesanos/${profile.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user?.name || profile.businessName,
    url,
    image: profile.coverImage || profile.logo || undefined,
    description: profile.story || profile.description || undefined,
    address: profile.region
      ? { '@type': 'PostalAddress', addressRegion: profile.region, addressCountry: 'CO' }
      : undefined,
    makesOffer: products.slice(0, 8).map((p) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Product', name: p.title },
      price: p.isPromotion && p.promotionPrice != null ? p.promotionPrice : p.price,
      priceCurrency: 'COP',
    })),
  };
}

function timeOnPlatform(createdAt) {
  if (!createdAt) return null;
  const months = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)));
  if (months < 1) return 'menos de un mes';
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `${years}+ ${years === 1 ? 'año' : 'años'}`;
}

export default function ArtisanPublicPage() {
  const { slug } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.get(`/artisan-profiles/slug/${slug}`)
      .then(({ data }) => setData(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (data?.profile?._id) {
      track('view_artisan_profile', { slug, artisan_id: data.profile.user?._id });
    }
  }, [data, slug]);

  const categories = useMemo(() => {
    if (!data?.products) return [];
    const set = new Set(data.products.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    if (activeCategory === 'all') return data.products;
    return data.products.filter((p) => p.category === activeCategory);
  }, [data, activeCategory]);

  const handleShare = async () => {
    const url = `${PUBLIC_URL}/artesanos/${slug}`;
    const shareData = {
      title: data?.profile?.businessName || 'Artesano en Manos Creadoras',
      text: `Conoce a ${data?.profile?.businessName} en Manos Creadoras`,
      url,
    };
    track('share_artisan_profile', { slug });
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // usuario canceló o falló: cae al fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch {
      toast.error('No pudimos copiar el enlace');
    }
  };

  if (loading) return <Spinner />;
  if (error || !data) {
    return (
      <main className="page" role="main">
        <ErrorState title="Artesano no encontrado" message="La vitrina que buscas no está disponible." backTo="/artesanos" backLabel="Ver artesanos" />
      </main>
    );
  }

  const { profile, products, stats } = data;
  const user = profile.user || {};
  const cleanWa = (profile.socialMedia?.whatsapp || user.whatsapp || '').replace(/[^0-9]/g, '');
  const waLink = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hola ${user.name}, te encontré en Manos Creadoras y me interesan tus piezas.`)}`
    : null;
  const tenure = timeOnPlatform(profile.createdAt);

  const totalProducts = stats?.totalProducts ?? products.length;
  const totalSold = stats?.totalSold ?? 0;
  const avgRating = stats?.avgRating ?? 0;

  return (
    <main role="main">
      <Seo
        title={`${profile.businessName} — ${profile.craft || 'Artesano'} en ${profile.region || 'Colombia'}`}
        description={profile.story || profile.description || `Conoce a ${user.name} en Manos Creadoras.`}
        image={profile.coverImage || profile.logo}
        type="profile"
        jsonLd={buildPersonJsonLd(profile, user, products)}
        keywords={[profile.craft, profile.region, profile.businessName, 'artesano Colombia'].filter(Boolean)}
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Artesanos', url: '/artesanos' },
          { name: profile.businessName, url: `/artesanos/${profile.slug}` },
        ]}
      />

      <nav className="page" aria-label="Migas de pan" style={{ paddingTop: '1rem', paddingBottom: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>
        {' / '}
        <Link to="/artesanos" style={{ color: 'var(--text-secondary)' }}>Artesanos</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>{profile.businessName}</span>
      </nav>

      {/* Hero */}
      <section
        className="artisan-hero"
        aria-label={`Vitrina de ${profile.businessName}`}
        style={profile.coverImage ? {
          backgroundImage: `linear-gradient(rgba(15,15,26,0.55), rgba(15,15,26,0.55)), url(${profile.coverImage})`,
        } : undefined}
      >
        <div className="artisan-hero-content">
          {profile.logo && (
            <img className="artisan-hero-logo" src={profile.logo} alt={profile.businessName} />
          )}
          <div style={{ flex: 1 }}>
            <span className="artisan-tag">
              <span className="artisan-tag-dot" />
              Artesano verificado
              {tenure && <span style={{ opacity: 0.85 }}>· {tenure} en Manos Creadoras</span>}
            </span>
            <h1 className="artisan-hero-title">{profile.businessName}</h1>
            <p className="artisan-hero-meta">
              {[user.name, profile.craft, profile.region].filter(Boolean).join(' · ')}
            </p>
            {profile.description && (
              <p className="artisan-hero-tagline">{profile.description}</p>
            )}
            <div className="artisan-hero-actions">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn accent"
                  onClick={() => track('whatsapp_clicked', { context: 'artisan_profile', slug })}
                >
                  Escribir por WhatsApp
                </a>
              )}
              <a href="#productos" className="btn ghost-light">
                Ver piezas
              </a>
              <button type="button" onClick={handleShare} className="btn-icon-light" aria-label="Compartir">
                <ShareIcon />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="page" style={{ paddingTop: '1.5rem' }}>
        {/* Stats strip */}
        {(totalProducts > 0 || totalSold > 0 || avgRating > 0) && (
          <section className="artisan-stats" aria-label="Métricas del artesano">
            <div className="artisan-stat">
              <span className="artisan-stat-value">{totalProducts}</span>
              <span className="artisan-stat-label">{totalProducts === 1 ? 'pieza publicada' : 'piezas publicadas'}</span>
            </div>
            {totalSold > 0 && (
              <div className="artisan-stat">
                <span className="artisan-stat-value">{totalSold}</span>
                <span className="artisan-stat-label">{totalSold === 1 ? 'pieza vendida' : 'piezas vendidas'}</span>
              </div>
            )}
            {avgRating > 0 && (
              <div className="artisan-stat">
                <span className="artisan-stat-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--accent-dark)' }}><StarIcon /></span>
                  {avgRating.toFixed(1)}
                </span>
                <span className="artisan-stat-label">valoración promedio</span>
              </div>
            )}
            {profile.region && (
              <div className="artisan-stat">
                <span className="artisan-stat-value" style={{ fontSize: '1rem', fontWeight: 600 }}>{profile.region}</span>
                <span className="artisan-stat-label">origen</span>
              </div>
            )}
          </section>
        )}

        {profile.story && (
          <section className="section" aria-label="Historia">
            <div className="section-header">
              <div>
                <h2 className="section-title">Sobre el taller</h2>
                <p className="section-subtitle">Lo que hace única a esta vitrina</p>
              </div>
            </div>
            <div className="card artisan-story">
              <p>{profile.story}</p>
            </div>
          </section>
        )}

        <section id="productos" className="section" aria-label="Piezas del artesano">
          <div className="section-header">
            <div>
              <h2 className="section-title">Piezas disponibles</h2>
              <p className="section-subtitle">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'pieza' : 'piezas'}
                {activeCategory !== 'all' ? ` en ${activeCategory}` : ''}
              </p>
            </div>
            <Link to="/productos" className="btn secondary">Ver todo el catálogo</Link>
          </div>

          {categories.length > 1 && (
            <div className="filter-group" style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className={`chip ${activeCategory === 'all' ? 'chip-active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                Todas
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${activeCategory === c ? 'chip-active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <h3>Aún no hay piezas en esta categoría</h3>
              <p className="muted">Prueba con otra o vuelve pronto.</p>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {filteredProducts.map((p) => (
                <ProductCard key={p._id} product={{ ...p, artisan: { name: user.name, _id: user._id } }} />
              ))}
            </div>
          )}
        </section>

        {(profile.socialMedia?.instagram || profile.socialMedia?.facebook || cleanWa || profile.website) && (
          <section className="section" aria-label="Contacto y redes">
            <div className="section-header">
              <div>
                <h2 className="section-title">Sigue al artesano</h2>
                <p className="section-subtitle">Conéctate directamente con su taller</p>
              </div>
            </div>
            <div className="card artisan-socials">
              {profile.socialMedia?.instagram && (
                <a href={`https://instagram.com/${profile.socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn secondary">
                  Instagram
                </a>
              )}
              {profile.socialMedia?.facebook && (
                <a href={profile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="btn secondary">
                  Facebook
                </a>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="btn secondary">
                  Sitio web
                </a>
              )}
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn accent"
                  onClick={() => track('whatsapp_clicked', { context: 'artisan_profile_footer', slug })}
                >
                  Escribir por WhatsApp
                </a>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Sticky WhatsApp CTA on mobile */}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="artisan-floating-wa"
          onClick={() => track('whatsapp_clicked', { context: 'artisan_profile_floating', slug })}
          aria-label="Escribir por WhatsApp"
        >
          💬 Escribir por WhatsApp
        </a>
      )}
    </main>
  );
}
