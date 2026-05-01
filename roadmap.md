# Roadmap — Manos Creadoras

> Marketplace de productos artesanales en Colombia. Plan operativo de 90 días, MVP de 30 días y backlog técnico priorizado.
> Fecha base: 2026-04-27. Stack: React+Vite, NestJS, MongoDB.

---

## 1. Diagnóstico (1 página)

**Lo bueno:** auth con JWT, roles, refresh-friendly, validación atómica de stock en backend, dashboards por rol, módulos de productos/órdenes/inventario/reseñas, error states y route guards en frontend.

**Lo bloqueante:**
1. Auto-registro de artesanos **bloqueado** en `backend/src/auth/auth.service.ts:23` (`role !== Buyer` lanza ForbiddenException).
2. Checkout crea pedido **sin método de pago ni siguiente paso** (`frontend/src/pages/CartPage.jsx:71`).
3. Métricas hardcodeadas en Home (`frontend/src/pages/HomePage.jsx:120-132`).
4. Sin landing para captar artesanos (`/vende`).
5. Sin GA4 ni Meta Pixel.
6. SEO mínimo (`frontend/index.html` sin OG/JSON-LD/sitemap).
7. Footer placeholder (`frontend/src/App.jsx:144-150`).
8. Registro y login fusionados (UX).
9. Sin perfil público de artesano (vitrina).
10. Sin notificaciones email/WhatsApp por cambio de estado.

**Decisiones de producto:**
- 0% comisión los primeros 3 meses para captar artesanos.
- Pago en MVP: WhatsApp + transferencia (Bancolombia/Nequi/Daviplata) + contraentrega. Pasarela (Wompi o Mercado Pago) en semana 12.
- Verificación manual de artesanos por admin (24h SLA).

---

## 2. MVP de 30 días (semanas 1-4)

### Semana 1 — Fundación de datos y honestidad
- [ ] Eliminar métricas falsas de `HomePage.jsx`.
- [ ] Endpoint `GET /metrics/public` con conteos reales (caché 10 min).
- [ ] Integrar GA4 + Meta Pixel via `frontend/src/lib/analytics.js`.
- [ ] `react-helmet-async` por página (title, description, OG).
- [ ] `robots.txt` + `sitemap.xml` estáticos.
- [ ] Crear cuentas Instagram, TikTok, WhatsApp Business.
- **KPI:** instrumentación 100%.

### Semana 2 — Auto-registro de artesanos
- [ ] `POST /auth/register-artisan` (rol `artisan`, `verificationStatus='pending'`, `isActive=false`).
- [ ] Frontend `/registro/artesano` con: nombre, oficio, ciudad/región, IG, WhatsApp, ¿qué vende?
- [ ] Email a admin al recibir registro.
- [ ] Admin aprueba en `/dashboard/artesanos` (acción `verify`).
- [ ] Landing pública `/vende` (propuesta de valor + CTA).
- **KPI:** 10 registros, 5 verificados.

### Semana 3 — Onboarding y publicación primer producto
- [ ] Wizard 3 pasos en dashboard artesano (perfil → primer producto → fotos).
- [ ] Compresión cliente de imágenes (`browser-image-compression`).
- [ ] Plantillas de descripción de producto.
- [ ] Campos en `artisan-profiles`: `story`, `craft`, `region`, `coverImage`, `slug`.
- **KPI:** 20 artesanos verificados, 60 productos publicados.

### Semana 4 — Checkout sin pasarela + primera venta
- [ ] `OrderStatus.AwaitingPayment` y `PaymentMethod` (whatsapp | transfer | cod).
- [ ] Selector método de pago en `CartPage.jsx`.
- [ ] Página `/pedido/:id/confirmacion` con instrucciones por método.
- [ ] Botón "Contactar al artesano por WhatsApp" con mensaje precargado (`wa.me`).
- [ ] Email de confirmación al comprador y al artesano.
- [ ] Decremento de stock condicionado al método (no descontar hasta `paid` para `cod`).
- **KPI:** 5 ventas confirmadas.

### Qué dejar para después
Perfil público artesano, blog, programa referidos, pasarela, recomendaciones, cupones avanzados, programa fidelidad.

### Qué NO construir todavía
App nativa, chat propio, IA recomendadora, multi-país, reembolsos automáticos, comisiones complejas.

---

## 3. Roadmap 90 días (12 semanas)

| Sem | Eje | Producto | Técnico | Marketing | KPI |
|---|---|---|---|---|---|
| 1 | Datos reales | Quitar métricas fake; CTA `/vende` | GA4+Pixel, helmet, sitemap, `metrics/public` | Abrir RRSS | Instrumentación 100% |
| 2 | Captación oferta | `/registro/artesano`, `/vende` | `register-artisan`, panel verificación | Outreach 30 talleres | 10 reg / 5 verificados |
| 3 | Onboarding | Wizard 3 pasos, compresión img | Campos perfil enriquecidos, slug | Visitas 20 talleres Boyacá/Bogotá | 20 verif / 60 productos |
| 4 | Cierre venta | Checkout multi-método, confirmación | Order states + emails | Primer Meta Ads $300k | 5 ventas |
| 5 | Confianza | Spotlight artesanos, badges, testimonios | Componente Spotlight, JSON config | 3 Reels historias | Conv 1.5% |
| 6 | Vitrina | `/artesanos/:slug` pública | SSR/prerender ruta artesano, JSON-LD | Cada artesano comparte URL | 30% comparten |
| 7 | SEO/Contenido | 4 artículos blog | Módulo `content` MDX, breadcrumbs | Backlinks Artesanías de Colombia | 50 visitas org/día |
| 8 | Postventa | Estados visibles, botones marca pagado/enviado/entregado | Notif email+WA por transición | Brevo automatizado | 50% reseñas |
| 9 | Activación demanda | Cupón primera compra, banner envío gratis | Módulo cupones simple | Meta+Google PMax + 5 micro-influencers | CAC < $25k |
| 10 | Embajadores y alianzas | Programa "trae un artesano" 5% | `referredBy` en users | Artesanías Col, CCB, cooperativas | 50 artesanos verif acumulados |
| 11 | Retención | Recomendaciones, emails inactivos 30d | `/products/recommended` por categoría | Newsletter mensual + campaña efeméride | Recompra 20% |
| 12 | Pasarela | Wompi/MercadoPago + mantener métodos manuales | Webhook estados | Comunicar tarjeta+PSE; reactivación | 100 ventas / conv 30% |

---

## 4. Backlog técnico priorizado

### P0 (semanas 1-4)

| Archivo | Cambio |
|---|---|
| `backend/src/auth/auth.service.ts:22` | Nuevo `registerArtisan(dto)` que crea user `artisan` + `pending` |
| `backend/src/users/schemas/user.schema.ts` | `verificationStatus`, `whatsapp`, `instagram`, `referredBy` |
| `backend/src/orders/schemas/order.schema.ts` | `paymentMethod`, `paymentStatus`, `customerNotes`, `shippingAddress` denormalizada, estado `awaiting_payment` |
| `backend/src/orders/orders.service.ts:21` | Aceptar `paymentMethod`; configurar decremento stock por método |
| `backend/src/notifications/` (NUEVO) | `sendOrderEmail`, `sendOrderWhatsAppLink` |
| `backend/src/metrics/metrics.controller.ts` (NUEVO) | `GET /metrics/public` con caché |
| `frontend/src/pages/HomePage.jsx:120-132` | Métricas reales de `/metrics/public` o ocultar |
| `frontend/src/pages/CartPage.jsx:71` | Selector método pago + redirect a confirmación |
| `frontend/src/pages/SellPage.jsx` (NUEVO) `/vende` | Landing artesanos |
| `frontend/src/pages/ArtisanRegisterPage.jsx` (NUEVO) `/registro/artesano` | Form auto-registro |
| `frontend/src/pages/OrderConfirmation.jsx` (NUEVO) | Instrucciones de pago |
| `frontend/index.html` | OG, Twitter, JSON-LD `Organization`, theme-color |
| `frontend/src/lib/analytics.js` (NUEVO) | Wrapper `track()` GA4+Pixel |
| `frontend/src/main.jsx` | Inyectar GA4 + Pixel + consent banner básico |
| `frontend/public/sitemap.xml`, `frontend/public/robots.txt` | Generación estática |

### P1 (semanas 5-8)

| Archivo | Cambio |
|---|---|
| `frontend/src/App.jsx:144-150` | Footer real → `/legal/envios`, `/legal/devoluciones`, `/contacto`, `/faq` |
| `frontend/src/App.jsx:140` | Reemplazar segundo "Registrarse" → `/registro` |
| `frontend/src/pages/ArtisanPublicPage.jsx` (NUEVO) `/artesanos/:slug` | Vitrina pública |
| `backend/src/artisan-profiles/schemas/` | `story`, `region`, `craft`, `slug`, `coverImage` |
| `frontend/src/pages/ProductDetail.jsx` | JSON-LD `Product`, breadcrumbs, OG dinámico |
| `backend/src/main.ts` | `helmet()` + `@nestjs/throttler` en `/auth/*` |

### P2 (semanas 9-12)

| Archivo | Cambio |
|---|---|
| `backend/src/products/products.service.ts` | `getRecommended(productId)` por categoría/artesano |
| `backend/src/coupons/` (NUEVO) | Módulo cupones simple |
| `backend/src/payments/wompi.service.ts` (NUEVO) | Integración Wompi + webhook |
| `backend/src/banners/` | `placement`, `priority` |
| `frontend/src/pages/HomePage.jsx:38-47` | Categorías desde `/categories` API |

---

## 5. Embudo del marketplace

| # | Etapa | Acción | Fricción | Solución | Evento |
|---|---|---|---|---|---|
| 1 | Llegada | aterriza Home | bounce | Hero claro + trust bar | `view_home` |
| 2 | Comprende valor | scroll | "¿por qué aquí?" | "Hecho en Colombia" + historias | `scroll_50` |
| 3 | Decide rol | comprar/vender | camino mezclado | dos CTAs | `select_path_*` |
| 4 | Registro artesano | form | largo | wizard + FAQ | `sign_up_started` |
| 5 | Verificación | admin revisa | espera | email "te avisamos en 24h" + WA | `artisan_verified` |
| 6 | Perfil completo | bio/región | pereza | wizard + ejemplos | `profile_completed` |
| 7 | Primer producto | fotos+desc | fotos pesadas | compresión + plantillas | `product_created` |
| 8 | Catálogo | explora | escasez | filtros, novedades | `view_item_list` |
| 9 | Detalle | ve producto | dudas envío | tabs envío/artesano | `view_item` |
| 10 | Add cart | agrega | stock dudoso | indicador stock | `add_to_cart` |
| 11 | Checkout | va al carrito | dirección obliga | guardar dirección al final | `begin_checkout` |
| 12 | Método pago | elige WA/transfer/COD | "¿es seguro?" | garantía + identidad | `select_payment_method` |
| 13 | Confirmación | recibe instrucciones | "¿y ahora?" | página + email + botón WA | `purchase` |
| 14 | Pago | transfiere | olvido | recordatorio 24h | `payment_confirmed` |
| 15 | Envío | artesano despacha | falta guía | plantilla empaque + transportadoras | `order_shipped` |
| 16 | Entrega | recibe | producto distinto | garantía 7d | `order_delivered` |
| 17 | Reseña | califica | olvido | email + WA día 5 | `review_submitted` |
| 18 | Recompra | vuelve | sin razón | newsletter + cupón referido | `repeat_purchase` |

---

## 6. Plan de analítica (GA4 + Meta Pixel)

| GA4 | Pixel | Propiedades | Archivo | KPI |
|---|---|---|---|---|
| `view_home` | `PageView` | — | `HomePage.jsx` | Sesiones |
| `view_item_list` | `ViewContent` | category, count | `ProductList.jsx` | CTR catálogo |
| `view_item` | `ViewContent` | id, name, price, category, artisan | `ProductDetail.jsx` | View→Cart |
| `add_to_cart` | `AddToCart` | id, value, currency=COP, qty | `ProductCard.jsx` | ATC rate |
| `begin_checkout` | `InitiateCheckout` | value, num_items | `CartPage.jsx` | Cart→Checkout |
| `select_payment_method` | `AddPaymentInfo` | payment_method | `CartPage.jsx` | Distribución |
| `purchase` | `Purchase` | tx_id, value, currency, items | `OrderConfirmation.jsx` | Conversión |
| `sign_up_started` | `Lead` | role | `ArtisanRegisterPage.jsx` | Registros iniciados |
| `sign_up_completed` | `CompleteRegistration` | role | post-registro | Registros completos |
| `artisan_verified` | `Lead` (CAPI) | craft, region | backend `auth.service.ts` | Artesanos activos |
| `product_created` | `Lead` | category, artisan | `ProductManagement.jsx` | Productos publicados |
| `whatsapp_clicked` | custom | context | `WhatsAppButton.jsx` | Clicks WA |
| `review_submitted` | custom | rating, product_id | `ProductDetail.jsx` | Tasa reseña |
| `cta_sell_clicked` | custom | placement | `HomePage.jsx`, `App.jsx` | CTR landing `/vende` |

Server-side `Purchase` y `artisan_verified` vía Conversions API para mejor matching.

---

## 7. Plan de marketing — Colombia

### Mensajes
- **Artesanos:** "Vende tus piezas a clientes de toda Colombia sin pagar comisión los primeros 3 meses. Tú creas, nosotros te llevamos los compradores."
- **Compradores:** "Lo hecho en Colombia, comprado directo del taller. Entrega a tu casa, sin intermediarios."

### Presupuesto sugerido inicial COP $1.500.000/mes
- Meta Ads (IG/FB): $900.000 — 60% retargeting, 40% prospecting "artesanías Colombia".
- Google Ads search: $400.000 — "mochila wayuu", "cerámica Ráquira", "artesanías Colombia online".
- Google PMax con catálogo: $200.000.

### Orgánico
- IG/TikTok: 3 Reels/sem por artesano destacado.
- Pinterest: tablero por categoría.
- SEO blog: 1 artículo/sem (12 en 90d).
- WhatsApp Business con catálogo + listas de difusión.

### Alianzas
- Artesanías de Colombia (directorio cruzado).
- Cámaras de Comercio (charlas).
- Cooperativas: Sandoná, Ráquira, Guacamayas, Manaure, San Jacinto.
- Universidades de diseño.

### Ferias
- Expoartesanías (diciembre).
- Mercados Usaquén (Bogotá), San Alejo (Medellín).

### Ciudades prioritarias
1. Bogotá — demanda.
2. Medellín — demanda + diseño.
3. Cali — demanda + acceso Pacífico.
4. Boyacá-Ráquira — oferta cerámica.
5. Pasto-Sandoná — iraca, mopa-mopa.
6. Riohacha-Manaure — wayuu.

### Primeros 50 artesanos
- 20 outreach directo (S1-S3).
- 15 IG DM talleres (S2-S6).
- 10 referidos (S6-S10).
- 5 alianzas Artesanías de Colombia (S5-S8).

### Primeras 100 ventas
- Cupón -15% primera compra (7 días).
- Envío gratis sobre $150.000.
- Campañas efemérides (Día Madre/Padre/Amor y Amistad).
- 5 micro-influencers (producto x Reel).
- Email a base + retargeting Meta a `add_to_cart`.

---

## 8. KPIs y metas 90 días

| Métrica | 30d | 60d | 90d | Fuente |
|---|---|---|---|---|
| Sesiones | 1.500 | 5.000 | 12.000 | GA4 |
| Tráfico orgánico % | 15% | 25% | 40% | GA4 |
| Artesanos registrados | 25 | 50 | 90 | Backend |
| Artesanos activos | 15 | 35 | 70 | Backend |
| Productos publicados | 80 | 180 | 320 | Backend |
| Conv visita→registro | 1% | 2% | 3% | GA4 |
| Conv carrito→pedido | 18% | 25% | 32% | GA4 |
| Conv pedido→pago | 55% | 65% | 75% | Backend |
| Ticket promedio | $80k | $90k | $95k | Backend |
| Recompra 30d | 8% | 15% | 22% | Backend |
| CAC pago | $40k | $30k | $22k | Meta+GA4 |
| Reseñas | 15 | 60 | 130 | Backend |
| Ventas confirmadas | 15 | 50 | 110 | Backend |
| GMV | $1.2M | $4.5M | $10.5M | Backend |

Tablero: Looker Studio sobre BigQuery export GA4 + export semanal a Sheet del endpoint `/admin/metrics`.

---

## 9. Propuesta de valor — Copy de Home

**Headline:**
> Arte hecho en Colombia, directo del taller a tu casa.

**Subtítulo:**
> Mochilas wayuu, cerámica de Ráquira, joyería en filigrana y mucho más. Compra directo al artesano y apoya el trabajo manual de nuestras regiones.

**CTAs para artesanos:**
1. "Vende en Manos Creadoras — 0% comisión los primeros 3 meses".
2. "Crea tu vitrina en 10 minutos".
3. "Tus piezas, vistas por compradores en toda Colombia".

**CTAs para compradores:**
1. "Explora piezas únicas".
2. "Conoce a los artesanos detrás de cada pieza".
3. "Envío a todo el país — paga al recibir si prefieres".

**Sección "Por qué vender en Manos Creadoras":**
- 0% comisión los primeros 3 meses.
- Vitrina propia que puedes compartir.
- Pedidos por WhatsApp y transferencia, no necesitas pasarela.
- Verificación que genera confianza al comprador.
- Acompañamiento en fotografía y descripción.

**Sección "Cómo funciona":**
1. Te registras y verificamos en 24h.
2. Subes tus productos con guía paso a paso.
3. Recibes pedidos por WhatsApp y email.
4. Despachas — o coordinamos transportadora.
5. Cobras cuando el cliente recibe.

**Sección de confianza:**
- "Artesano verificado" con foto del taller.
- Reseñas con foto del comprador.
- Garantía 7 días.
- Envío rastreable.
- Pago contra entrega disponible.

**Sección historias:**
- Featurear 3 artesanos por mes con Reel + ficha "Conoce a {nombre}, {oficio}, {región}".

---

## 10. Diseño visual

**Paleta:**
- Primario: terracota cálido `#C2410C`.
- Secundario: verde musgo `#4D6A4F`.
- Acento: amarillo iraca `#F2B93D`.
- Neutros: arena `#F5EFE6`, carbón `#1F1A17`.
- Texto secundario: `#6B6357`.

**Tipografía:**
- Títulos: Playfair Display (ya cargada).
- Cuerpo: Inter (ya cargada).
- Numerales tabulares para precios.

**Estilo visual:**
- Mucha foto de producto y de manos trabajando.
- Bordes 12-16px, sombras suaves, no glassmorphism.
- Microcopy cercano, no corporativo.

**Componentes clave:**
- `ProductCard` con badge "Verificado" y artesano + región.
- `ArtisanSpotlight` con foto del taller.
- `WhatsAppButton` con contexto (producto/artesano/orden).
- `TrustBar` con 4 ítems: verificado, contraentrega, garantía, hecho en Colombia.

**Animaciones:**
- Fade-in en scroll con `IntersectionObserver`.
- Hover sutil en cards (translateY 2px + shadow).
- Skeleton durante carga (no spinners genéricos).

**Hero:**
- Texto izquierda + imagen de producto sobre fondo de taller (lifestyle).
- Dos CTAs: "Ver catálogo" (acento) y "Vender en Manos Creadoras" (ghost).
- Trust bar inmediatamente debajo.

**Catálogo:**
- Filtros laterales en desktop, drawer en mobile.
- Chip "Hecho en {región}" en cada card.
- Vista lista alterna a grid.

**Dashboard artesano:**
- Bienvenida con nombre + checklist progreso (perfil, productos, ventas, reseñas).
- Tarjetas grandes: ventas del mes, pedidos pendientes, productos vistos.
- Botón flotante "Nuevo producto".

**Checkout sin pasarela:**
- Paso 1: revisar carrito.
- Paso 2: dirección de envío.
- Paso 3: método de pago (3 cards: WhatsApp, transferencia, contraentrega) con explicación.
- Paso 4: confirmación con instrucciones específicas + botón WhatsApp directo al artesano.

---

## 11. Riesgos y mitigaciones

| Riesgo | Prob | Impacto | Mitigación |
|---|---|---|---|
| Catálogo escaso | Alta | Crítico | Outreach directo S1-S6, alianzas, 0% comisión 3m |
| Pedidos WA se caen | Alta | Alto | Recordatorio 24h/48h, auto-cancelar 72h, restaurar stock |
| Desconfianza sin pasarela | Media | Alto | Garantía 7d, contraentrega, testimonios, sello verificado |
| Disputas sin chat propio | Media | Medio | Founder mediador WA, SLA 24h, políticas claras |
| Métricas falsas viralizadas | Baja | Crítico | Eliminar antes de cualquier campaña paga (S1) |
| Imágenes pesadas | Media | Medio | Compresión cliente + lazy + Cloudflare/Cloudinary |
| Brute force registro | Media | Medio | `@nestjs/throttler` + hCaptcha |
| Tributario al activar pasarela | Alta | Alto | Asesor contable antes de S12, T&C claros |
| Stock fantasma contraentrega | Media | Medio | No descontar hasta `paid` o `shipped` por método |
| Dependencia Meta | Media | Alto | Diversificar Google + orgánico + alianzas desde S6 |
| Founder cuello de botella | Alta | Alto | Roles "moderador" desde 50 artesanos |

---

## 12. Próximas 5 acciones (esta semana)

1. Eliminar métricas falsas en `frontend/src/pages/HomePage.jsx:120-132`.
2. Crear `frontend/src/lib/analytics.js` y cargar GA4+Pixel.
3. Implementar `POST /auth/register-artisan` y `/registro/artesano`.
4. Crear `frontend/src/pages/SellPage.jsx` con la propuesta de valor a artesanos.
5. Diseñar el selector de método de pago en `CartPage.jsx` y la página `OrderConfirmation`.

---

## 13. Plan por fases — Estado actual

> Plan paralelo al roadmap operativo, enfocado en madurar el producto que ya está vivo.
> Última actualización: 2026-05-01.

### FASE 1 — Conversión y experiencia del comprador  ✅ COMPLETADA

#### Sub-entrega 1.1 — Catálogo, filtros y badges  ✅
- `backend/src/products/products.service.ts` — filtros `minPrice`, `maxPrice`, `minRating`, `inStock` y `sort` (`relevance | bestsellers | rating | newest | price_asc | price_desc`); default ordena por `soldCount → ratingAverage → createdAt`.
- `backend/src/products/products.repository.ts` — `findPaginated` ahora acepta `sort`.
- `backend/src/products/schemas/product.schema.ts` — índices simples en `price`, `stock`, `ratingAverage`; índices compuestos `category+price` y `category+soldCount`.
- `frontend/src/pages/ProductList.jsx` — chips de categoría, rango de precio, valoración mínima, toggles "solo disponibles" / "en oferta", select de orden, chips de filtros activos, botón "limpiar todo". Persistencia en URL.
- `frontend/src/ui/ProductCard.jsx` — badges acumulables (Oferta, Agotado, Quedan N≤3, Más vendido ≥10, Top valorado ≥4.5★, Nuevo ≤30d), badge de descuento `-X%`, precio con separador de miles `es-CO`.
- Test backend ajustado a la nueva firma de `findPaginated`.

#### Sub-entrega 1.2 — Detalle de producto + confianza  ✅
- `frontend/src/pages/ProductDetail.jsx` rediseñado:
  - Galería con imagen principal + thumbnails clicables.
  - Stepper de cantidad con validación contra stock; botón principal muestra subtotal calculado.
  - Stock badge con tres estados (ok / quedan ≤5 / agotado).
  - Grid de 4 beneficios (envío, devolución, pago seguro, autenticidad).
  - Tarjeta de artesano con fetch lazy a `/artisan-profiles/:userId` (cover, logo, story, craft+region, link a perfil público por slug).
  - Cross-sell: 4 productos relacionados de la misma categoría reutilizando `/products?category=X` con filtro client-side.
  - FAQ acordeón con 4 preguntas (envíos, devoluciones, autenticidad, pagos).
  - Reviews con header de "rating summary" (puntuación grande + estrellas). Cada review marca al autor con check de "comprador verificado".
- Sin cambios en backend ni schemas.

#### Sub-entrega 1.3 — Carrito reforzado  ✅
- `frontend/src/state/CartContext.jsx`:
  - Persistencia versionada (`{ version: 2, items, savedAt }`) con compatibilidad hacia atrás con el formato legacy (array plano).
  - `revalidate()` que trae estado fresco de cada producto y emite avisos tipados (`unavailable`, `out_of_stock`, `reduced`, `price_change`); ajusta cantidades y refresca el `product` con datos vigentes.
  - Helpers nuevos: `subtotal`, `savings` (suma de `(price − promotionPrice) × qty`), `count` (total unidades). `total` mantenido como alias de `subtotal`.
  - `warnings` y `dismissWarning(productId)`.
  - Try/catch en `localStorage.setItem`.
- `frontend/src/pages/CartPage.jsx`:
  - Revalidación automática al entrar; toast + banner si algo cambió.
  - Avisos por línea (rojo/amarillo/azul según el tipo).
  - Cada línea muestra precio original tachado, ahorro por línea, advertencias de stock crítico o error si excede.
  - Resumen extendido: subtotal, ahorro por ofertas (verde), envío estimado, total estimado.
  - Selector de zona de envío (3 opciones) con costo + tiempo estimado.
  - Barra de progreso hacia envío gratis (umbral $250.000) o badge verde si ya califica.
  - Botón "Vaciar carrito" con `window.confirm`.
  - Imagen y título del item ahora linkean al detalle.
  - Trust row al fondo del summary.
- `frontend/src/state/CartContext.test.jsx` — test de persistencia adaptado, 2 tests nuevos (legacy rehydrate, savings/subtotal/count).

#### Sub-entrega 1.4 — Checkout + perfil de envío inline  ✅
- `backend/src/orders/orders.service.ts` — validaciones añadidas: `phone` con ≥7 chars y rechazo de items vacíos.
- `frontend/src/components/ShippingProfileBlock.jsx` (nuevo) — carga `/clients/me`, muestra resumen verde si está completo o formulario inline si falta. Reporta estado vía `onReadyChange(boolean)`.
- `frontend/src/pages/CartPage.jsx` — integra el bloque al inicio de la columna izquierda; bloquea botón ("Completa tu envío") si shipping no está listo. Pre-flight con scroll suave si el usuario fuerza el submit. Post-mortem: si el backend rechaza por perfil reabre el formulario; si rechaza por stock dispara `revalidate()`.
- `frontend/src/pages/BuyerProfilePage.jsx` — `phone` ahora es obligatorio (`required` + `inputMode="tel"`), soporte de `?return=/carrito` para redirigir tras guardar.
- `frontend/src/pages/OrderConfirmation.jsx` — timeline visual de 5 pasos (esperando pago → pago confirmado → en proceso → enviado → entregado), oculto si la orden está cancelada. Acentos corregidos.
- Test backend nuevo: "should throw if buyer has no phone".

**Estado consolidado FASE 1:** 46 tests backend + 20 tests frontend en verde, build vite OK.

---

### FASE 2 — Atraer y retener artesanos  ⏳ EN CURSO

Objetivos: subir oferta y calidad del marketplace mejorando perfil público, beneficios visibles, dashboard y gestión de productos.

#### Sub-entrega 2.1 — Perfil público del artesano  ✅
- `backend/src/products/products.repository.ts` — método `aggregateArtisanStats(artisanId)` que devuelve `{ totalProducts, totalSold, avgRating, ratedProducts }`.
- `backend/src/artisan-profiles/artisan-profiles.service.ts` — `getPublicBySlug` ahora devuelve `{ profile, products, stats }`.
- `frontend/src/pages/ArtisanPublicPage.jsx` rediseñado:
  - Hero con logo circular sobre cover, tag "verificado" con tiempo en plataforma, oficio·región y tagline opcional.
  - Strip de stats (piezas publicadas, piezas vendidas, valoración, origen).
  - Sección "Sobre el taller" con tipografía editorial y comilla decorativa.
  - Filtros por categoría sobre los productos del artesano (chips).
  - Botón compartir nativo con fallback a portapapeles + tracking `share_artisan_profile`.
  - CTA flotante de WhatsApp en mobile con tracking dedicado.
  - Migas de pan, mejores acentos y links a redes/sitio.

#### Sub-entrega 2.2 — Landing `/vende` y registro de artesanos  ✅
- `frontend/src/pages/SellPage.jsx`:
  - Texto con acentos correctos en todas las secciones.
  - Nueva sección "Comisiones transparentes" con 4 tiers visuales (Mes 1–3 a 0%, Desde Mes 4 al 8%) que comunican el modelo sin ambigüedad.
  - Sección "Lo que dicen los artesanos" con 3 success cards (avatar + cita + métrica) — placeholders editables cuando haya casos reales.
  - FAQ ampliada con la pregunta "¿Y si no vendo nada?" para reducir miedo a registrarse.
  - CTA final con link a login para artesanos que ya tengan cuenta.
- `frontend/src/pages/ArtisanRegisterPage.jsx`:
  - Layout 2 columnas: formulario + panel lateral con beneficios y testimonio.
  - Migas de pan + secciones agrupadas con micro-titulares ("Tus datos personales", "Tu oficio y región", "Cómo te contactamos").
  - Medidor de fortaleza de contraseña (5 niveles, color dinámico).
  - Toggle de mostrar/ocultar contraseña.
  - Validación bloquea envío si la contraseña tiene score < 3.
  - Pantalla de éxito enriquecida con checklist de "qué hacer mientras esperas aprobación" y dos CTAs.
  - Acentos correctos en todos los textos y placeholders, regiones y oficios actualizados.
- `frontend/src/styles.css`: bloques nuevos para `commission-tier`, `success-card`, `register-grid`, `password-strength`, `success-checklist`. Responsive a 1 columna bajo 900px.

- [x] **Landing `/vende` (SellPage)** y `ArtisanRegisterPage` — explicar comisiones, exposición, soporte, tiempos de aprobación, casos de éxito.

#### Sub-entrega 2.3 — Dashboard del artesano  ✅
- `backend/src/dashboard/dashboard.service.ts` — `getArtisanDashboard` ahora calcula: `ordersToAct`, `awaitingPayment`, `inProgress`, `readyToShip`, `productsWithoutReviews`, `outOfStockMine`, `monthGrowthPct`, `thisMonthRevenue`. Devuelve `ordersToAct` (lista) y `inventorySummary` con `ratingAverage` por producto.
- `frontend/src/pages/Dashboard.jsx`:
  - Saludo contextual por hora ("Buenos días/tardes/noches, {nombre}").
  - CTA principal "Nuevo producto" en el header del artesano.
  - Banner urgente cuando hay pedidos por atender (con desglose: esperando pago / listos / en proceso) + CTA directo a `/dashboard/pedidos`.
  - Banner informativo con ingresos del mes y crecimiento vs mes anterior (verde/rojo).
  - Stats reordenadas con énfasis en "Por atender" → ingresos → productos → "Sin reseñas".
- `frontend/src/styles.css` — bloques `dashboard-banner`, `dashboard-banner-urgent`, `dashboard-banner-info` con responsive.

- [x] **Dashboard del artesano** — métricas reordenadas, banners contextuales, saludo dinámico.
- [x] **Métricas accionables del artesano** — vistas (telemetría existente), productos sin stock/reseñas, crecimiento mensual.

#### Sub-entrega 2.5 — Gestión de productos  ✅
- `frontend/src/pages/ProductManagement.jsx`:
  - Mini-stats inline (Total / En stock / Bajo stock / Agotados / Sin reseñas / En oferta) con colores semánticos.
  - Buscador por título + chips de filtro (Todos, En stock, Bajo stock, Agotados, Sin reseñas, En oferta).
  - Columnas enriquecidas: thumbnail del producto, alerta "Sin imagen", precio con tachado en oferta, formato COP, columna de reseñas con score o "Sin reseñas".
  - Acción "Ver" en cada fila que abre el detalle público en nueva pestaña.
  - Confirmación clara al eliminar y mensaje del backend si hay error (p. ej. órdenes activas).
  - Empty state distinguido: primer producto vs filtro sin resultados.
- `frontend/src/styles.css` — `.pm-stat` con variantes success/warning/error.

- [x] **Gestión de productos** — filtros, mini-stats, mejor edición y validación visual.

---

### FASE 3 — Mejoras técnicas del backend  ✅ COMPLETADA

- [x] **Índices Mongo**: `Product` (price, stock, ratingAverage + compuestos category+price y category+soldCount), `Order` (buyer+createdAt, status+createdAt, items.product, paymentMethod+status), `User` (role+isActive, role+verificationStatus), `Review` (product+createdAt, buyer+product unique).
- [x] **Filtros y sort en `/products`** — minPrice, maxPrice, minRating, inStock, sort (relevance/bestsellers/rating/newest/price_asc/price_desc).
- [x] **Validaciones reforzadas en `/orders`** — phone obligatorio, items vacíos, address+city.
- [x] **Métricas backend** — `aggregateArtisanStats` y `getArtisanDashboard` enriquecido.
- [x] **Seguridad — CORS y body limits**: `main.ts` ahora acepta lista separada por comas en `FRONTEND_URL` con validación dinámica de origen y `BODY_LIMIT` configurable (default `2mb`).
- [x] **Rate limiting** — ya existía vía `ThrottlerModule` (60s/30 req).
- [x] **Persistencia versionada del carrito** (frontend) — fixed en sub-entrega 1.3.

> Nota: el rol `superadmin` se mantiene como un superset de `admin`. Si se decide consolidar, requiere migración de datos y revisión de guards — se deja para una iteración dedicada cuando haya volumen real de usuarios admin.

---

### FASE 4 — Diseño y percepción de marca  ✅ COMPLETADA (iteración inicial)

- [x] **Home** — acentos correctos en categorías, hero, trust bar y banners. Precios en showcase con `toLocaleString('es-CO')`.
- [x] **Dashboard** — banners contextuales y jerarquía visual mejorada (sub-entrega 2.3).
- [x] **ProductCard** — badges acumulables, descuento visible, formato COP (sub-entrega 1.1).
- [x] **Sistema visual `styles.css`** — bloques nuevos para badges, chips, filtros, dashboard banners, artisan hero, cart warnings, shipping cards, FAQ, success cards, commission tiers. Variables de paleta consolidadas en `:root`.

> Nota: refinamientos visuales adicionales (segunda iteración del catálogo, micro-animaciones, skeletons) quedan para iterar tras tener telemetría real de uso.

---

### FASE 5 — SEO y crecimiento  ✅ COMPLETADA (iteración inicial)

- [x] **Componente `Seo` extendido** — soporta `keywords` (array o string) y `breadcrumbs` con generación automática del JSON-LD `BreadcrumbList`.
- [x] **Schema enriquecido**:
  - `Product` JSON-LD con AggregateRating + Reviews (sub-entrega 1.2).
  - `Person` JSON-LD para artesanos (con makesOffer + PostalAddress) (sub-entrega 2.1).
  - `BreadcrumbList` automático en ProductDetail, ArtisanPublicPage, ProductList.
- [x] **Metadata por página** — keywords contextuales en ProductDetail (categoría, artesano, "hecho a mano"), ArtisanPublicPage (oficio, región), ProductList (categoría).
- [x] **Sitemap dinámico** — ya existía vía `backend/src/seo/seo.service.ts` (commit `ad31a43`).

> Nota: contenido editorial del blog y landings dedicadas por categoría/región quedan como iniciativas de marketing/contenido, no de producto. Se trabajan cuando arranque la estrategia editorial.

---

### Próxima sub-entrega — Iteración guiada por telemetría

Las 5 fases del plan inicial quedan completadas en su iteración base. Los siguientes pasos dependen de datos reales:

1. **Activar GA4 + Pixel** y dejar correr 2 semanas para tener señales reales.
2. **Telemetría del catálogo** — ver qué filtros/sort usan los compradores y cuáles ignoran.
3. **Funnel de checkout** — medir abandono entre carrito y confirmación; revalidar revalidate() y bloque de envío.
4. **Conversión del registro de artesano** — A/B del medidor de contraseña y de la pantalla de éxito.
5. **Casos de éxito reales en `/vende`** — reemplazar los placeholders cuando haya 3 historias contables.
6. **Roles `superadmin`/`admin`** — consolidar cuando haya volumen real de admins.
