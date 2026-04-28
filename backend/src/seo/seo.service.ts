import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../products/products.repository';
import { ArtisanProfilesRepository } from '../artisan-profiles/artisan-profiles.repository';
import { ConfigService } from '@nestjs/config';

const STATIC_URLS: { path: string; priority: number; changefreq: string }[] = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/productos', priority: 0.9, changefreq: 'daily' },
  { path: '/artesanos', priority: 0.9, changefreq: 'daily' },
  { path: '/vende', priority: 0.9, changefreq: 'weekly' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/registro/artesano', priority: 0.7, changefreq: 'monthly' },
  { path: '/legal/envios', priority: 0.4, changefreq: 'monthly' },
  { path: '/legal/devoluciones', priority: 0.4, changefreq: 'monthly' },
  { path: '/legal/terminos', priority: 0.3, changefreq: 'monthly' },
  { path: '/legal/privacidad', priority: 0.3, changefreq: 'monthly' },
  { path: '/contacto', priority: 0.5, changefreq: 'monthly' },
  { path: '/faq', priority: 0.5, changefreq: 'monthly' },
];

const BLOG_SLUGS = [
  'mochila-wayuu-historia-y-significado',
  'ceramica-de-raquira-cuidados-y-piezas',
  'filigrana-de-mompox-joyeria-patrimonial',
  '5-razones-comprar-artesania-colombiana',
];

const CACHE_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class SeoService {
  private cache: { xml: string; expiresAt: number } | null = null;

  constructor(
    private readonly products: ProductsRepository,
    private readonly artisanProfiles: ArtisanProfilesRepository,
    private readonly config: ConfigService,
  ) {}

  async getSitemap(): Promise<string> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.xml;
    }

    const base = (this.config.get<string>('PUBLIC_URL') || 'https://manoscreadoras.com').replace(/\/$/, '');

    const [productsResult, artisans] = await Promise.all([
      this.products.findPaginated({}, 1, 1000),
      this.artisanProfiles.findPublic({ limit: 1000 }),
    ]);

    const urls: { loc: string; priority: number; changefreq: string; lastmod?: string }[] = [];

    for (const u of STATIC_URLS) {
      urls.push({ loc: `${base}${u.path}`, priority: u.priority, changefreq: u.changefreq });
    }

    for (const slug of BLOG_SLUGS) {
      urls.push({ loc: `${base}/blog/${slug}`, priority: 0.7, changefreq: 'monthly' });
    }

    for (const a of artisans as any[]) {
      if (!a.slug) continue;
      urls.push({
        loc: `${base}/artesanos/${a.slug}`,
        priority: 0.8,
        changefreq: 'weekly',
        lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
      });
    }

    for (const p of productsResult.data as any[]) {
      urls.push({
        loc: `${base}/productos/${p._id}`,
        priority: 0.7,
        changefreq: 'weekly',
        lastmod: (p as any).updatedAt ? new Date((p as any).updatedAt).toISOString() : undefined,
      });
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((u) => [
        '  <url>',
        `    <loc>${escapeXml(u.loc)}</loc>`,
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : '',
        `    <changefreq>${u.changefreq}</changefreq>`,
        `    <priority>${u.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].filter(Boolean).join('\n')),
      '</urlset>',
    ].join('\n');

    this.cache = { xml, expiresAt: Date.now() + CACHE_TTL_MS };
    return xml;
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
