import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './state/AuthContext';
import { useCart } from './state/CartContext';
import Spinner from './ui/Spinner';
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

// Componente que fuerza cambio de password
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
          <img src="/logo.png" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
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
          <Link to="/productos?promo=true">Ofertas</Link>
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
          El marketplace de artesanias mas grande de Latinoamerica. Conectamos artesanos con amantes del arte hecho a mano.
        </p>
      </div>
      <div className="footer-col">
        <h4>Explorar</h4>
        <Link to="/productos">Catalogo</Link>
        <Link to="/productos?promo=true">Ofertas</Link>
        <Link to="/productos?category=ceramica">Ceramica</Link>
        <Link to="/productos?category=tejidos">Tejidos</Link>
      </div>
      <div className="footer-col">
        <h4>Cuenta</h4>
        <Link to="/login">Iniciar sesion</Link>
        <Link to="/login">Registrarse</Link>
        <Link to="/dashboard">Mi dashboard</Link>
        <Link to="/carrito">Mi carrito</Link>
      </div>
      <div className="footer-col">
        <h4>Soporte</h4>
        <Link to="/">Centro de ayuda</Link>
        <Link to="/">Politicas de envio</Link>
        <Link to="/">Devoluciones</Link>
        <Link to="/">Contacto</Link>
      </div>
    </div>
    <div className="footer-bottom">
      <span>2024 ManosCreadoras. Todos los derechos reservados.</span>
      <span>Hecho con dedicacion en Latinoamerica</span>
    </div>
  </footer>
);

export default function App() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login';

  return (
    <>
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
        Ir al contenido principal
      </a>
      <Header />
      <div id="main-content">
        <ForcePasswordChange>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/productos" element={<ProductList />} />
              <Route path="/productos/:id" element={<ProductDetail />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cambiar-contrasena" element={<ChangePasswordPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/productos" element={<ProductManagement />} />
              <Route path="/dashboard/pedidos" element={<OrderManagement />} />
              <Route path="/dashboard/inventario" element={<InventoryPage />} />
              <Route path="/dashboard/perfil-negocio" element={<ArtisanProfilePage />} />
              <Route path="/dashboard/finanzas" element={<FinancialPage />} />
              <Route path="/dashboard/promociones" element={<PromotionsPage />} />
              <Route path="/dashboard/artesanos" element={<ArtisanManagement />} />
              <Route path="/dashboard/mi-perfil" element={<BuyerProfilePage />} />
            </Routes>
          </Suspense>
        </ForcePasswordChange>
      </div>
      {!hideFooter && <Footer />}
    </>
  );
}
