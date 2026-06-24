# Roadmap — Manos Creadoras

> Marketplace de artesanías colombianas. Revisión completa al **2026-06-24**.
> Stack: React 18 + Vite · NestJS · MongoDB · Docker Compose.

---

## Estado actual del proyecto

### ✅ Lo que ya está construido y funciona

| Módulo | Estado | Notas |
|---|---|---|
| Auth JWT + roles | ✅ Completo | buyer / artisan / admin / superadmin, recuperación de contraseña, forzar cambio |
| Auto-registro artesanos | ✅ Completo | `/registro/artesano` con flujo de revisión, email al admin |
| Checkout multi-método | ✅ Completo | WhatsApp / transferencia / contra entrega, validación de stock atómica |
| Carrito con revalidación | ✅ Completo | Warnings de stock, envío gratis $250k, zonas estimadas |
| Perfil público artesano | ✅ Completo | Slugs SEO-friendly, JSON-LD `Person`, compartir redes |
| Listado `/artesanos` | ✅ Completo | Filtros por craft/región, búsqueda por nombre |
| Métricas públicas | ✅ Completo | `GET /metrics/public` con `hasMinimumScale` gate |
| SEO por página | ✅ Completo | `Seo.jsx` inyecta title, OG, canonical; JSON-LD en productos y artesanos |
| Analytics | ✅ Completo | GA4 + Meta Pixel vía `analytics.js`, tracking de eventos clave |
| Blog | ✅ Completo | `BlogListPage` y `BlogPostPage` con slug y SEO |
| Footer funcional | ✅ Completo | Links a catálogo, cuenta, soporte, legal |
| Dashboard por rol | ✅ Completo | Artesano, admin, comprador con vistas diferenciadas |
| Inventario artesano | ✅ Completo | Movimientos, alertas de stock mínimo |
| Módulo mail | ✅ Completo | Nodemailer; confirmación de pedido, notificación artesano, recuperación |
| Upload de imágenes | ✅ Completo | Multer local, campos en producto y perfil |
| Reseñas de productos | ✅ Completo | POST por comprador, recalcula `ratingAverage` |
| Swagger docs | ✅ Completo | `/api/docs` disponible |
| Docker Compose | ✅ Completo | Backend + Frontend + health checks |
| Throttling global | ✅ Completo | 30 req/min vía `@nestjs/throttler` |

---

## 🔴 Brechas críticas (bloquean crecimiento real)

### B1 — Sin pasarela de pago real
El sistema actual requiere coordinación manual. Es el mayor freno a la conversión y a la confianza del comprador.
- **Impacto:** abandono de carrito alto, sin capacidad de escalar
- **Solución:** integrar Wompi (Colombia) como primera pasarela

### B2 — Carrito solo en localStorage
Si el usuario cambia de dispositivo o borra caché, pierde su carrito.
- **Impacto:** pérdida de sesiones y ventas
- **Solución:** persistir carrito en BD (`/cart` endpoint), sincronizar al login

### B3 — Sin refresh token
JWT expira sin renovación silenciosa. El usuario es deslogueado abruptamente.
- **Impacto:** mala UX para sesiones largas
- **Solución:** implementar `refreshToken` en httpOnly cookie + endpoint `/auth/refresh`

### B4 — Imágenes sin CDN ni optimización
Imágenes servidas desde el servidor NestJS con Multer. Sin WebP, sin resize, sin lazy loading inteligente.
- **Impacto:** rendimiento lento, Core Web Vitals malos
- **Solución:** migrar upload a Cloudinary (tier gratuito) o Supabase Storage

### B5 — Sin CI/CD pipeline
Deploy es manual con Docker. Sin tests automatizados en PR.
- **Impacto:** regresiones silenciosas, deploy riesgoso
- **Solución:** GitHub Actions con lint + tests + build check en cada PR

### B6 — Sin MongoDB en docker-compose
`docker-compose.yml` depende de `MONGO_URI` externa pero no define el servicio `mongodb` en el compose. Desarrollo local requiere MongoDB separado.
- **Solución:** agregar servicio `mongodb` con volumen persistente al compose

---

## 🟡 Mejoras importantes (UX y conversión)

### M1 — Búsqueda full-text real
Actualmente `ProductList` filtra por título en el frontend. Sin índices de texto en MongoDB.
- **Solución:** añadir `$text` index en producto (`title`, `description`, `tags`), endpoint `GET /products/search?q=`

### M2 — Favoritos / Wishlist persistente
No hay sistema de wishlist. Los usuarios no pueden guardar productos para después.
- **Solución:** colección `wishlists` en MongoDB, endpoint `POST/DELETE /me/wishlist/:productId`

### M3 — Sistema de cupones y descuentos
No hay módulo de cupones. Las promociones son solo por producto individual.
- **Solución:** colección `coupons`, validación en orden, campo `couponCode` en checkout

### M4 — Notificaciones en tiempo real
Los cambios de estado del pedido (artesano → enviado) solo se comunican por email.
- **Solución:** Server-Sent Events (SSE) para el comprador en `OrderConfirmation`, badge en header

### M5 — Reseñas de artesanos
Solo existen reseñas de productos. No hay reputación general del artesano.
- **Solución:** colección `artisanReviews`, promedio en perfil público, verificación que el comprador tuvo una orden con ese artesano

### M6 — Chat comprador ↔ artesano
Actualmente el contacto es por WhatsApp externo. Sin trazabilidad dentro de la plataforma.
- **Solución:** mensajería básica en BD (sin WebSocket en primera fase), polling cada 15s

### M7 — Programa de referidos con UI
El campo `referredBy` existe en el schema pero no hay UI ni incentivo visible.
- **Solución:** página `/referidos`, link único por artesano, conteo de referidos en dashboard

### M8 — Tracking de envío
Una vez el artesano marca "enviado", el comprador no tiene información.
- **Solución:** campo `trackingUrl` en orden, visible en `OrderConfirmation`

---

## 🟢 Mejoras técnicas (deuda y calidad)

### T1 — Cobertura de tests
Solo hay 1 test (`ProtectedRoute.test.jsx`). El backend no tiene tests de integración.
- **Meta:** 70% cobertura en servicios críticos (auth, orders, products)
- **Herramientas:** Vitest + Testing Library (frontend), Jest + Supertest (backend)

### T2 — Error monitoring
Sin Sentry ni equivalent. Los errores de producción no se capturan.
- **Solución:** Sentry SDK en frontend y backend (tier gratuito: 5k errores/mes)

### T3 — Rate limiting por usuario
El throttling actual es global por IP. Un usuario autenticado con token puede bombardear endpoints.
- **Solución:** throttling by `userId` en endpoints de creación (pedidos, reseñas)

### T4 — Paginación en listado de artesanos
`ArtisanListPage` carga todos los artesanos. Sin paginación ni scroll infinito.
- **Solución:** `page` + `limit` en `GET /artisan-profiles/public`, scroll infinito con Intersection Observer

### T5 — Variables de entorno documentadas
No hay `.env.example`. Un desarrollador nuevo no sabe qué variables configurar.
- **Solución:** crear `backend/.env.example` y `frontend/.env.example`

### T6 — Seguridad: headers HTTP
Sin CSP, sin HSTS, sin `X-Frame-Options` en Nginx. `helmet` en NestJS pero sin tuning fino.
- **Solución:** configurar Nginx con headers de seguridad, afinar CSP para permitir CDN de imágenes

### T7 — Logs estructurados
`nest-winston` está instalado pero el nivel de logging no está diferenciado por entorno.
- **Solución:** `LOG_LEVEL` env var, logs en JSON para producción (parseable por Loki/Datadog)

---

## Plan de ejecución — próximas 12 semanas

### Semana 1-2 — Fundación técnica
- [ ] Agregar `mongodb` service a `docker-compose.yml` con volumen
- [ ] Crear `backend/.env.example` y `frontend/.env.example`
- [ ] GitHub Actions: lint + build check en cada PR
- [ ] Sentry SDK en frontend (DSN gratuito)
- [ ] Refresh token con httpOnly cookie

### Semana 3-4 — Pasarela de pago (Wompi)
- [ ] Cuenta Wompi sandbox
- [ ] Endpoint `POST /orders/:id/payment-link` → devuelve Wompi checkout URL
- [ ] Webhook `POST /payments/wompi/webhook` para confirmar pago
- [ ] Frontend: botón "Pagar con Wompi" en `OrderConfirmation`
- [ ] Actualización automática de `paymentStatus` y notificación por email
- **KPI:** primera venta real procesada por la plataforma

### Semana 5 — CDN de imágenes
- [ ] Migrar `UploadModule` para usar Cloudinary API
- [ ] Transformaciones automáticas: WebP, resize 800px máx, thumbnail 200px
- [ ] Actualizar `productImage.js` helper para URL Cloudinary
- [ ] Migrar imágenes existentes con script de migración
- **KPI:** LCP < 2.5s en página de producto

### Semana 6 — Carrito persistente
- [ ] Schema `Cart` en MongoDB (`userId`, `items[]`, `updatedAt`)
- [ ] Endpoints: `GET/PUT /me/cart`, merge al login
- [ ] Actualizar `CartContext` para sincronizar con BD cuando el usuario está autenticado

### Semana 7 — Búsqueda y filtros avanzados
- [ ] Índice `$text` en productos (title, description, tags)
- [ ] `GET /products/search?q=&category=&region=&minPrice=&maxPrice=&sort=`
- [ ] Actualizar `ProductList` con filtros de precio y región, chips activos
- [ ] Autocompletado en el `SearchBar` del header (debounce 300ms)

### Semana 8 — Favoritos y reseñas de artesanos
- [ ] Schema `Wishlist` + endpoints `/me/wishlist`
- [ ] Botón corazón en `ProductCard` y `ProductDetail`
- [ ] Schema `ArtisanReview` + endpoint `POST /artisans/:id/reviews`
- [ ] Rating promedio en `ArtisanPublicPage`

### Semana 9 — Notificaciones y tracking
- [ ] SSE endpoint `GET /orders/:id/stream` para estado en tiempo real
- [ ] Campo `trackingUrl` en orden, editable por artesano desde dashboard
- [ ] Sección de tracking en `OrderConfirmation`
- [ ] Push notification via OneSignal (web push) para cambios de estado

### Semana 10 — Sistema de cupones
- [ ] Schema `Coupon` (código, tipo: porcentaje/fijo, límite de uso, expiración)
- [ ] `POST /coupons/validate` → devuelve descuento aplicable
- [ ] UI en `CartPage`: campo para ingresar cupón, muestra el descuento

### Semana 11 — Tests y calidad
- [ ] Tests de integración backend: auth, orders, products (meta 70% cobertura servicios)
- [ ] Tests E2E Playwright: flujo compra completa, registro artesano, login
- [ ] Rate limiting por userId en endpoints de pedidos y reseñas
- [ ] Paginación en listado de artesanos (Intersection Observer)

### Semana 12 — Programa de referidos y PWA
- [ ] Página `/referidos` con link único del artesano
- [ ] Conteo de referidos en dashboard del artesano
- [ ] `manifest.json` + service worker básico (cache de assets estáticos)
- [ ] Modo offline: mostrar carrito guardado aunque no haya red

---

## Backlog de largo plazo (post semana 12)

| Idea | Valor | Complejidad |
|---|---|---|
| App móvil (React Native) | Alto | Alta |
| Integración Mercado Libre / Rappi | Alto | Alta |
| Recomendaciones con ML (CF básico) | Medio | Alta |
| Panel de analytics para artesano (ventas, vistas, conversión) | Alto | Media |
| Internacionalización (i18n) inglés / francés para exportación | Medio | Media |
| Chat comprador ↔ artesano en plataforma | Alto | Media |
| Certificación de artesano (foto con producto, verificación humana) | Alto | Baja |
| Factura electrónica PDF descargable | Medio | Baja |
| Sistema de A/B testing (feature flags con Growthbook) | Medio | Media |

---

## Métricas de éxito

| Métrica | Hoy (estimado) | Meta semana 12 |
|---|---|---|
| Artesanos activos | < 10 | 50 |
| Pedidos/mes | 0 real | 200 |
| LCP (página producto) | > 4s | < 2.5s |
| Cobertura de tests | ~1% | 70% (servicios críticos) |
| Tiempo de deploy | Manual (~20min) | < 5 min (CI/CD) |
| Errores sin reportar | 100% | 0% (Sentry) |

---

> Generado el 2026-06-24 con análisis directo del código fuente (frontend + backend + docker).
> Revisar y repriorizar en cada sprint según feedback de usuarios reales.
