import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ArtisanSpotlight() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/artisan-profiles/featured?limit=3')
      .then(({ data }) => setArtisans(Array.isArray(data) ? data : []))
      .catch(() => setArtisans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || artisans.length === 0) return null;

  return (
    <section className="section" aria-label="Artesanos destacados">
      <div className="section-header">
        <div>
          <h2 className="section-title">Conoce a los artesanos</h2>
          <p className="section-subtitle">Cada pieza tiene una historia. Descubre quien la hizo.</p>
        </div>
        <Link to="/artesanos" className="btn secondary">Ver todos</Link>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {artisans.map((a) => {
          const u = a.user || {};
          const cover = a.coverImage || 'https://via.placeholder.com/600x400?text=Manos+Creadoras';
          return (
            <Link
              key={a._id}
              to={`/artesanos/${a.slug}`}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateRows: '160px 1fr',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.35)), url(${cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ padding: '1rem' }}>
                <span className="pill accent" style={{ fontSize: '0.7rem' }}>Verificado</span>
                <h3 style={{ margin: '0.4rem 0 0.25rem', fontSize: '1.05rem' }}>{a.businessName}</h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                  {[u.name, a.craft, a.region].filter(Boolean).join(' · ')}
                </p>
                {a.story && (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.story}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
