// Wrapper unificado GA4 + Meta Pixel.
// `track(eventName, props)` envía a GA4 (snake_case) y al Pixel
// (mapeando los nombres a eventos estándar de Meta cuando aplica).

const GA4_ID = import.meta.env.VITE_GA4_ID;
const PIXEL_ID = import.meta.env.VITE_PIXEL_ID;

let initialized = false;

function loadGa4() {
  if (!GA4_ID || typeof document === 'undefined') return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: false });
}

function loadPixel() {
  if (!PIXEL_ID || typeof window === 'undefined') return;
  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', PIXEL_ID);
}

export function initAnalytics() {
  if (initialized) return;
  initialized = true;
  loadGa4();
  loadPixel();
}

// Mapa de eventos GA4 → Pixel estándar (los demás van como evento custom).
const PIXEL_STANDARD_MAP = {
  view_item: 'ViewContent',
  view_item_list: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  select_payment_method: 'AddPaymentInfo',
  purchase: 'Purchase',
  sign_up_started: 'Lead',
  sign_up_completed: 'CompleteRegistration',
  product_created: 'Lead',
  artisan_verified: 'Lead',
};

export function track(eventName, props = {}) {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', eventName, props);
  }

  if (window.fbq) {
    const pixelEvent = PIXEL_STANDARD_MAP[eventName];
    if (pixelEvent) {
      window.fbq('track', pixelEvent, normalizeForPixel(props));
    } else {
      window.fbq('trackCustom', eventName, normalizeForPixel(props));
    }
  }
}

export function pageView(path) {
  if (window.gtag && GA4_ID) {
    window.gtag('event', 'page_view', { page_path: path });
  }
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
}

function normalizeForPixel(props) {
  const out = { ...props };
  if (out.value != null) out.value = Number(out.value);
  if (!out.currency && out.value != null) out.currency = 'COP';
  return out;
}
