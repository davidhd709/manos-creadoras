# Artesanías Online

E-commerce simplificado para artesanos (frontend React + backend NestJS/MongoDB) con roles y JWT.

## Requisitos
- Node 18+
- MongoDB local o remoto
- npm/pnpm/yarn

## Backend
```bash
cd backend
npm install
# Variables de entorno
$env:MONGO_URI="mongodb://localhost:27017/artesanias"
$env:JWT_SECRET="supersecret"
npm run start:dev
```
- Dependencia de hashing usa `bcryptjs` (sin binarios nativos) para evitar fallos de compilación.
- Endpoints en `http://localhost:3000`.
- Rutas: auth (register/login), users (me, admin list), products (list/top/detail/crud/promo/reviews), orders (buyer/my, artisan, admin), banners (list, admin crea).
- Guards: `JwtAuthGuard` valida token; `RolesGuard` valida rol con decorador `@Roles`.
- Promos: `PATCH /products/:id/promotion` activa/desactiva y ajusta `promotionPrice`.
- Reseñas: compradores `POST /products/:id/reviews` recalcula `ratingAverage`.
- Órdenes: `POST /orders` descuenta stock y suma `soldCount`.

## Frontend
```bash
cd frontend
npm install
npm run dev # http://localhost:5173
```
- Config base API en `src/api.js`.
- Contextos: `AuthContext` (JWT + rol), `CartContext` (carrito y total).
- Páginas: Home (banners + top 10), listado con filtros, detalle con reseñas y promoción, carrito, login/registro, dashboard por rol (admin/artesano/comprador).

## Flujo sugerido de prueba
1. Registrar cuentas: admin, artesano, comprador.
2. Artesano crea productos y activa promociones.
3. Comprador agrega al carrito y crea pedido; deja reseña.
4. Admin revisa usuarios, productos y órdenes en dashboard.
