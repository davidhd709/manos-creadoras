import { Link, useParams } from 'react-router-dom';
import Seo from '../lib/Seo';
import ErrorState from '../ui/ErrorState';
import { findPost, BLOG_POSTS } from '../data/blogPosts';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'https://manoscreadoras.com';

function buildArticleJsonLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'Manos Creadoras' },
    publisher: {
      '@type': 'Organization',
      name: 'Manos Creadoras',
      logo: { '@type': 'ImageObject', url: `${PUBLIC_URL}/logo.png` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${PUBLIC_URL}/blog/${post.slug}`,
    },
  };
}

// Render minimalista: títulos `## ` y listas `- `, párrafos por línea en blanco.
function renderBody(body) {
  const lines = body.trim().split('\n');
  const out = [];
  let listBuffer = [];
  let paraBuffer = [];

  const flushPara = () => {
    if (paraBuffer.length) {
      out.push(<p key={`p-${out.length}`}>{renderInline(paraBuffer.join(' '))}</p>);
      paraBuffer = [];
    }
  };
  const flushList = () => {
    if (listBuffer.length) {
      out.push(
        <ul key={`ul-${out.length}`} style={{ paddingLeft: '1.25rem' }}>
          {listBuffer.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
        </ul>,
      );
      listBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (line.startsWith('## ')) {
      flushPara(); flushList();
      out.push(<h2 key={`h-${out.length}`} style={{ marginTop: '1.5rem' }}>{line.slice(3)}</h2>);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      flushPara();
      listBuffer.push(line.replace(/^\d+\.\s/, ''));
      continue;
    }
    if (line.startsWith('- ')) {
      flushPara();
      listBuffer.push(line.slice(2));
      continue;
    }
    flushList();
    paraBuffer.push(line);
  }
  flushPara();
  flushList();
  return out;
}

function renderInline(text) {
  // **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = findPost(slug);

  if (!post) {
    return (
      <main className="page" role="main">
        <Seo title="Articulo no encontrado" noindex />
        <ErrorState title="Articulo no encontrado" backTo="/blog" backLabel="Ver blog" />
      </main>
    );
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="page" role="main">
      <Seo
        title={post.title}
        description={post.excerpt}
        image={post.cover}
        type="article"
        jsonLd={buildArticleJsonLd(post)}
      />

      <nav aria-label="Migas de pan" style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>{' / '}
        <Link to="/blog" style={{ color: 'var(--text-secondary)' }}>Blog</Link>{' / '}
        <span style={{ color: 'var(--text)' }}>{post.title}</span>
      </nav>

      <article style={{ maxWidth: 760, margin: '0 auto' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <span className="pill accent" style={{ fontSize: '0.78rem' }}>{post.category}</span>
          <h1 style={{ margin: '0.5rem 0 0.5rem', fontFamily: "'Playfair Display', serif" }}>{post.title}</h1>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            {new Date(post.publishedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}{post.readingMinutes} min de lectura
            {post.region ? ` · ${post.region}` : ''}
          </p>
        </header>

        <img src={post.cover} alt={post.title} loading="lazy" style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }} />

        <div style={{ fontSize: '1.02rem', lineHeight: 1.75 }}>
          {renderBody(post.body)}
        </div>

        <div className="card" style={{ padding: '1.5rem', marginTop: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-light), var(--bg-warm))' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>Lleva una pieza a tu casa</h3>
          <p className="muted" style={{ margin: '0 0 1rem' }}>
            Explora el catalogo de artesanos en Colombia y compra directo del taller.
          </p>
          <Link to="/productos" className="btn accent" style={{ padding: '0.75rem 1.5rem' }}>
            Ver catalogo
          </Link>
        </div>

        {related.length > 0 && (
          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>Te puede interesar</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {related.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="card" style={{ padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
                  <span className="pill accent" style={{ fontSize: '0.7rem' }}>{p.category}</span>
                  <h3 style={{ fontSize: '0.95rem', margin: '0.4rem 0 0.25rem' }}>{p.title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
