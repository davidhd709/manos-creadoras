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
