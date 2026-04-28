import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import ProductCard from '../ui/ProductCard';
import Seo from '../lib/Seo';
import { track } from '../lib/analytics';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'https://manoscreadoras.com';

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

export default function ArtisanPublicPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  if (loading) return <Spinner />;
  if (error || !data) {
    return (
      <main className="page" role="main">
        <ErrorState title="Artesano no encontrado" message="La vitrina que buscas no esta disponible." backTo="/artesanos" backLabel="Ver artesanos" />
      </main>
    );
  }

  const { profile, products } = data;
  const user = profile.user || {};
  const cleanWa = (profile.socialMedia?.whatsapp || user.whatsapp || '').replace(/[^0-9]/g, '');
  const waLink = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hola ${user.name}, te encontre en Manos Creadoras y me interesan tus piezas.`)}`
    : null;

  return (
    <main role="main">
      <Seo
        title={`${profile.businessName} — ${profile.craft || 'Artesano'} en ${profile.region || 'Colombia'}`}
        description={profile.story || profile.description || `Conoce a ${user.name} en Manos Creadoras.`}
        image={profile.coverImage || profile.logo}
        type="profile"
        jsonLd={buildPersonJsonLd(profile, user, products)}
      />

      {/* Hero */}
      <section
        className="hero-full"
        aria-label={`Vitrina de ${profile.businessName}`}
        style={profile.coverImage ? {
          backgroundImage: `linear-gradient(rgba(15,15,26,0.55), rgba(15,15,26,0.55)), url(${profile.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="hero-container" style={{ alignItems: 'flex-end' }}>
          <div className="hero-content" style={{ color: profile.coverImage ? '#fff' : undefined }}>
            <span className="hero-tag">
              <span className="hero-tag-dot" />
              Artesano verificado
            </span>
            <h1 className="hero-title" style={{ color: profile.coverImage ? '#fff' : undefined }}>
              {profile.businessName}
            </h1>
            <p className="hero-desc" style={{ color: profile.coverImage ? 'rgba(255,255,255,0.92)' : undefined }}>
              {[user.name, profile.craft, profile.region].filter(Boolean).join(' · ')}
            </p>
            <div className="hero-actions">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-cta"
                  onClick={() => track('whatsapp_clicked', { context: 'artisan_profile', slug })}
                >
                  Escribir por WhatsApp
                </a>
              )}
              <a href="#productos" className="hero-cta-ghost">
                Ver productos
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="page" style={{ paddingTop: '2rem' }}>
        {profile.story && (
          <section className="section" aria-label="Historia">
            <div className="section-header">
              <div>
                <h2 className="section-title">Su historia</h2>
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: 1.65 }}>{profile.story}</p>
            </div>
          </section>
        )}

        <section id="productos" className="section" aria-label="Piezas del artesano">
          <div className="section-header">
            <div>
              <h2 className="section-title">Piezas disponibles</h2>
              <p className="section-subtitle">{products.length} piezas en su vitrina</p>
            </div>
            <Link to="/productos" className="btn secondary">Ver todo el catalogo</Link>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              <h3>Aun no hay piezas publicadas</h3>
              <p className="muted">Vuelve pronto. Si quieres conocer mas, escribele directo.</p>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {products.map((p) => (
                <ProductCard key={p._id} product={{ ...p, artisan: { name: user.name } }} />
              ))}
            </div>
          )}
        </section>

        {(profile.socialMedia?.instagram || profile.socialMedia?.facebook || cleanWa || profile.website) && (
          <section className="section" aria-label="Contacto">
            <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
    </main>
  );
}
