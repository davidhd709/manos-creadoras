import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext';
import { useCart } from './state/CartContext';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import Spinner from './ui/Spinner';
import usePageTracking from './lib/usePageTracking';
import './styles.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const ArtisanProfilePage = lazy(() => import('./pages/ArtisanProfilePage'));
const FinancialPage = lazy(() => import('./pages/FinancialPage'));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage'));
const ArtisanManagement = lazy(() => import('./pages/ArtisanManagement'));
const BuyerProfilePage = lazy(() => import('./pages/BuyerProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const SellPage = lazy(() => import('./pages/SellPage'));
const ArtisanRegisterPage = lazy(() => import('./pages/ArtisanRegisterPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const ArtisanPublicPage = lazy(() => import('./pages/ArtisanPublicPage'));
const ArtisanListPage = lazy(() => import('./pages/ArtisanListPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

const ROLE_LABELS = { superadmin: 'Super Admin', admin: 'Admin', artisan: 'Artesano', buyer: 'Mi cuenta' };

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ForcePasswordChange = ({ children }) => {
  const { user, mustChangePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && mustChangePassword && location.pathname !== '/cambiar-contrasena') {
      navigate('/cambiar-contrasena');
    }
  }, [user, mustChangePassword, location.pathname, navigate]);

  return children;
};

const NotFoundPage = () => (
  <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
    <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Pagina no encontrada</p>
    <Link to="/" className="btn accent">Volver al inicio</Link>
  </div>
);

const Header = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header>
      <nav className="nav-bar" aria-label="Navegacion principal">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="Manos Creadoras" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span>Manos<span className="brand-accent">Creadoras</span></span>
        </Link>

        <div className="search-bar" role="search">
          <label htmlFor="search-input" className="sr-only">Buscar artesanias</label>
          <SearchIcon />
          <input
            id="search-input"
            placeholder="Buscar artesanias, ceramica, tejidos..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/productos?search=${e.target.value}`);
            }}
          />
        </div>

        <div className="pill-nav">
          <Link to="/" className={isActive('/')}>Inicio</Link>
          <Link to="/productos" className={isActive('/productos')}>Catalogo</Link>
          <Link to="/artesanos" className={isActive('/artesanos')}>Artesanos</Link>
          <Link to="/vende" className={isActive('/vende')}>Vende</Link>
          <Link to="/carrito" className={`cart-badge ${isActive('/carrito')}`} aria-label="Ver carrito de compras">
            <CartIcon />
            {items.length > 0 && <span className="badge-count">{items.length}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`btn secondary ${isActive('/dashboard')}`} style={{ padding: '0.45rem 1rem' }}>
                {ROLE_LABELS[user.role] || user.role}
              </Link>
              <button className="btn secondary" style={{ padding: '0.45rem 1rem' }} onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn accent" style={{ padding: '0.5rem 1.25rem' }}>
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-grid">
      <div>
        <div className="footer-brand">
          Manos<span className="brand-accent">Creadoras</span>
        </div>
        <p className="footer-desc">
          Marketplace de artesanias hechas en Colombia. Compra directo del taller del artesano.
        </p>
      </div>
      <div className="footer-col">
        <h4>Explorar</h4>
        <Link to="/productos">Catalogo</Link>
        <Link to="/artesanos">Artesanos</Link>
        <Link to="/productos?category=ceramica">Ceramica</Link>
        <Link to="/productos?category=tejidos">Tejidos</Link>
      </div>
      <div className="footer-col">
        <h4>Cuenta</h4>
        <Link to="/login">Iniciar sesion</Link>
        <Link to="/registro">Crear cuenta</Link>
        <Link to="/vende">Vender en MC</Link>
        <Link to="/carrito">Mi carrito</Link>
      </div>
      <div className="footer-col">
        <h4>Soporte</h4>
        <Link to="/faq">Preguntas frecuentes</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/legal/envios">Envios</Link>
        <Link to="/legal/devoluciones">Devoluciones</Link>
        <Link to="/contacto">Contacto</Link>
      </div>
      <div className="footer-col">
        <h4>Legal</h4>
        <Link to="/legal/terminos">Terminos y condiciones</Link>
        <Link to="/legal/privacidad">Politica de privacidad</Link>
      </div>
    </div>
    <div className="footer-bottom">
      <span>{new Date().getFullYear()} ManosCreadoras. Todos los derechos reservados.</span>
      <span>Hecho en Colombia</span>
    </div>
  </footer>
);

export default function App() {
  const location = useLocation();
  usePageTracking();
  const hideFooter = ['/login', '/registro', '/recuperar-contrasena', '/restablecer-contrasena'].some((p) =>
    location.pathname.startsWith(p),
  );

  return (
    <>
      <a href="#main-content" className="skip-link">
        Ir al contenido principal
      </a>
      <Header />
      <div id="main-content">
        <ForcePasswordChange>
          <Suspense fallback={<Spinner />}>
            <Routes>
              {/* Rutas publicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/productos" element={<ProductList />} />
              <Route path="/productos/:id" element={<ProductDetail />} />
              <Route path="/artesanos" element={<ArtisanListPage />} />
              <Route path="/artesanos/:slug" element={<ArtisanPublicPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/pedido/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/registro/artesano" element={<ArtisanRegisterPage />} />
              <Route path="/vende" element={<SellPage />} />
              <Route path="/legal/:slug" element={<LegalPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
              <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
              <Route path="/cambiar-contrasena" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

              {/* Rutas protegidas - requieren autenticacion */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/pedidos" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />

              {/* Rutas de artesano */}
              <Route path="/dashboard/productos" element={<RoleRoute roles={['artisan', 'admin']}><ProductManagement /></RoleRoute>} />
              <Route path="/dashboard/inventario" element={<RoleRoute roles={['artisan', 'admin']}><InventoryPage /></RoleRoute>} />
              <Route path="/dashboard/perfil-negocio" element={<RoleRoute roles={['artisan']}><ArtisanProfilePage /></RoleRoute>} />
              <Route path="/dashboard/finanzas" element={<RoleRoute roles={['artisan', 'admin']}><FinancialPage /></RoleRoute>} />
              <Route path="/dashboard/promociones" element={<RoleRoute roles={['artisan', 'admin']}><PromotionsPage /></RoleRoute>} />

              {/* Rutas de admin */}
              <Route path="/dashboard/artesanos" element={<RoleRoute roles={['admin', 'superadmin']}><ArtisanManagement /></RoleRoute>} />

              {/* Rutas de comprador */}
              <Route path="/dashboard/mi-perfil" element={<RoleRoute roles={['buyer']}><BuyerProfilePage /></RoleRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ForcePasswordChange>
      </div>
      {!hideFooter && <Footer />}
    </>
  );
}
