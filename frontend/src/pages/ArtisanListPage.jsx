import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import Seo from '../lib/Seo';

const REGIONS = [
  'Antioquia', 'Atlantico', 'Bogota D.C.', 'Bolivar', 'Boyaca', 'Caldas', 'Caqueta', 'Cauca',
  'Cesar', 'Choco', 'Cordoba', 'Cundinamarca', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
  'Nariño', 'Norte de Santander', 'Putumayo', 'Quindio', 'Risaralda', 'Santander', 'Sucre',
  'Tolima', 'Valle del Cauca',
];

const CRAFTS = [
  'Ceramica', 'Tejido (mochilas, telar)', 'Joyeria y filigrana', 'Madera y tallado',
  'Cuero', 'Vidrio', 'Iraca y palma', 'Mopa-mopa', 'Pintura y arte',
];

export default function ArtisanListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const craft = searchParams.get('craft') || '';
  const region = searchParams.get('region') || '';

  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (craft) params.set('craft', craft);
    if (region) params.set('region', region);
    params.set('limit', '36');
    return params.toString();
  }, [craft, region]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.get(`/artisan-profiles/public?${queryString}`)
      .then(({ data }) => setArtisans(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [queryString]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <main className="page" role="main">
      <Seo
        title="Artesanos en Colombia"
        description="Descubre a los artesanos detras de cada pieza. Filtra por oficio y region."
      />
      <div className="section-header">
        <div>
          <h1 className="section-title">Artesanos</h1>
          <p className="section-subtitle">Conoce los talleres detras de cada pieza.</p>
        </div>
        <Link to="/vende" className="btn secondary">¿Eres artesano?</Link>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <span className="muted" style={{ fontSize: '0.85rem' }}>Oficio:</span>
          <select value={craft} onChange={(e) => updateFilter('craft', e.target.value)}>
            <option value="">Todos</option>
            {CRAFTS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <span className="muted" style={{ fontSize: '0.85rem' }}>Region:</span>
          <select value={region} onChange={(e) => updateFilter('region', e.target.value)}>
            <option value="">Todas</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        {(craft || region) && (
          <button
            type="button"
            className="btn secondary"
            onClick={() => setSearchParams(new URLSearchParams())}
            style={{ marginLeft: 'auto' }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState title="No pudimos cargar los artesanos" onRetry={() => setSearchParams(searchParams)} />
      ) : artisans.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <h3>Aun no hay artesanos con esos filtros</h3>
          <p className="muted">Prueba quitando algun filtro o vuelve pronto. Cada semana sumamos talleres nuevos.</p>
          <Link to="/vende" className="btn accent" style={{ marginTop: '1rem' }}>¿Eres artesano? Vende aqui</Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          {artisans.map((a) => {
            const u = a.user || {};
            const cover = a.coverImage || a.logo || 'https://via.placeholder.com/600x400?text=Manos+Creadoras';
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
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.4)), url(${cover})`,
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
