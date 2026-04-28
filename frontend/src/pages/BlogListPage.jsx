import { Link } from 'react-router-dom';
import Seo from '../lib/Seo';
import { BLOG_POSTS } from '../data/blogPosts';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'https://manoscreadoras.com';

function buildBlogJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Manos Creadoras — Blog',
    url: `${PUBLIC_URL}/blog`,
    blogPost: BLOG_POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.publishedAt,
      url: `${PUBLIC_URL}/blog/${p.slug}`,
      image: p.cover,
    })),
  };
}

export default function BlogListPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <main className="page" role="main">
      <Seo
        title="Blog — historias del taller artesanal colombiano"
        description="Lee sobre las tecnicas, regiones y artesanos detras de cada pieza: mochilas wayuu, ceramica de Raquira, filigrana de Mompox y mas."
        jsonLd={buildBlogJsonLd()}
      />

      <nav aria-label="Migas de pan" style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>{' / '}<span style={{ color: 'var(--text)' }}>Blog</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Historias del taller</h1>
          <p className="section-subtitle">Tecnicas, regiones y artesanos detras de cada pieza.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {sorted.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${p.slug}`}
            className="card"
            style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateRows: '160px 1fr', textDecoration: 'none', color: 'inherit' }}
          >
            <div
              aria-hidden="true"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.3)), url(${p.cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div style={{ padding: '1.1rem' }}>
              <span className="pill accent" style={{ fontSize: '0.7rem' }}>{p.category}</span>
              <h2 style={{ fontSize: '1.05rem', margin: '0.4rem 0 0.4rem', lineHeight: 1.35 }}>{p.title}</h2>
              <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>{p.excerpt}</p>
              <div className="muted" style={{ marginTop: '0.6rem', fontSize: '0.78rem' }}>
                {new Date(p.publishedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}{p.readingMinutes} min de lectura
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
