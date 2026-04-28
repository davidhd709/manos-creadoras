import { useEffect } from 'react';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'https://manoscreadoras.com';

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, key, val] = selector.match(/\[(.+?)="(.+?)"\]/) || [];
    if (key && val) el.setAttribute(key, val);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function Seo({
  title,
  description,
  image,
  type = 'website',
  jsonLd,
  noindex = false,
}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | Manos Creadoras`
      : 'Manos Creadoras — Marketplace de artesanías hechas en Colombia';
    document.title = fullTitle;

    const desc = description ||
      'Descubre piezas únicas hechas a mano por artesanos colombianos. Cerámica, tejidos, joyería y mucho más, directo del taller a tu casa.';
    const url = `${PUBLIC_URL}${window.location.pathname}`;
    const img = image || `${PUBLIC_URL}/og-cover.jpg`;

    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex,nofollow' : 'index,follow');

    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', img);
    setMeta('meta[property="og:site_name"]', 'content', 'Manos Creadoras');
    setMeta('meta[property="og:locale"]', 'content', 'es_CO');

    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', desc);
    setMeta('meta[name="twitter:image"]', 'content', img);

    setLink('canonical', url);

    if (jsonLd) {
      setJsonLd('jsonld-page', jsonLd);
    } else {
      const el = document.getElementById('jsonld-page');
      if (el) el.remove();
    }
  }, [title, description, image, type, jsonLd, noindex]);

  return null;
}
