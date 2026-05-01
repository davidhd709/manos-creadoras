import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import StatsCard from '../components/StatsCard';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import OnboardingChecklist from '../components/OnboardingChecklist';

const ROLE_TITLES = {
  superadmin: 'Panel Super Administrador',
  admin: 'Panel de Administración',
  artisan: 'Panel de Artesano',
  buyer: 'Mi Panel',
};

function formatCOP(value) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(false);

    const endpoint =
      user.role === 'superadmin' || user.role === 'admin'
        ? '/dashboard/admin'
        : user.role === 'artisan'
          ? '/dashboard/artisan'
          : '/dashboard/buyer';

    api.get(endpoint)
      .then(({ data }) => setData(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (!user) return <div className="page" role="alert"><div className="empty-state"><h3>Inicia sesión para ver tu dashboard</h3><Link to="/login" className="btn accent" style={{ marginTop: '1rem' }}>Iniciar sesión</Link></div></div>;
  if (loading) return <Spinner />;
  if (error) return <div className="page"><ErrorState title="Error al cargar el dashboard" message="No pudimos obtener tus datos. Intenta de nuevo." onRetry={fetchDashboard} /></div>;
  if (!data) return <div className="page"><ErrorState title="Sin datos" message="No hay información disponible por el momento." backTo="/" /></div>;

  const orderColumns = [
    { key: 'id', label: 'ID', render: (row) => <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>#{(row._id || '').slice(-6)}</span> },
    { key: 'status', label: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'total', label: 'Total', render: (row) => <span style={{ fontWeight: 600 }}>${row.totalOrder?.toLocaleString() || 0}</span> },
    { key: 'items', label: 'Productos', render: (row) => row.items?.length || 0 },
  ];

  const monthlySales = (data.monthlySales || []).slice().reverse();

  const isArtisan = user.role === 'artisan';
  const stats = data.stats || {};
  const ordersToActCount = stats.ordersToAct || 0;

  return (
    <main className="page" role="main">
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title">
            {greeting()}, {user.name?.split(' ')[0] || 'artesano'}
          </h1>
          <p className="section-subtitle">{ROLE_TITLES[user.role] || 'Dashboard'}</p>
        </div>
        {isArtisan && (
          <Link to="/dashboard/productos" className="btn accent" style={{ padding: '0.7rem 1.25rem' }}>
            + Nuevo producto
          </Link>
        )}
      </div>

      {isArtisan && ordersToActCount > 0 && (
        <div className="dashboard-banner dashboard-banner-urgent">
          <div className="dashboard-banner-icon">📬</div>
          <div style={{ flex: 1 }}>
            <strong>Tienes {ordersToActCount} {ordersToActCount === 1 ? 'pedido por atender' : 'pedidos por atender'}</strong>
            <span>
              {stats.awaitingPayment > 0 && `${stats.awaitingPayment} esperando pago · `}
              {stats.readyToShip > 0 && `${stats.readyToShip} listos para procesar · `}
              {stats.inProgress > 0 && `${stats.inProgress} en proceso`}
            </span>
          </div>
          <Link to="/dashboard/pedidos" className="btn accent" style={{ padding: '0.6rem 1rem' }}>
            Ver pedidos
          </Link>
        </div>
      )}

      {isArtisan && stats.monthGrowthPct != null && stats.thisMonthRevenue > 0 && (
        <div className="dashboard-banner dashboard-banner-info">
          <div className="dashboard-banner-icon">{stats.monthGrowthPct >= 0 ? '📈' : '📉'}</div>
          <div style={{ flex: 1 }}>
            <strong>
              Este mes: {formatCOP(stats.thisMonthRevenue)}
              {stats.monthGrowthPct !== 0 && (
                <span style={{ marginLeft: '0.5rem', color: stats.monthGrowthPct >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {stats.monthGrowthPct > 0 ? '+' : ''}{stats.monthGrowthPct}% vs mes anterior
                </span>
              )}
            </strong>
            <span>Sigue compartiendo tu vitrina para mantener el ritmo.</span>
          </div>
        </div>
      )}

      {isArtisan && <OnboardingChecklist />}

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <>
            <StatsCard title="Ingresos totales" value={`$${data.stats?.totalRevenue?.toLocaleString() || 0}`} subtitle="Total acumulado" />
            <StatsCard title="Pedidos" value={data.stats?.totalOrders || 0} subtitle={`${data.stats?.pendingOrders || 0} pendientes`} />
            <StatsCard title="Productos" value={data.stats?.totalProducts || 0} subtitle={`${data.inventory?.lowStock || 0} bajo stock`} />
            <StatsCard title="Usuarios" value={data.stats?.totalUsers || 0} subtitle={`${data.stats?.totalArtisans || 0} artesanos, ${data.stats?.totalBuyers || 0} compradores`} />
          </>
        )}
        {isArtisan && (
          <>
            <StatsCard title="Por atender" value={stats.ordersToAct || 0} subtitle="Pedidos en flujo" />
            <StatsCard title="Ingresos totales" value={formatCOP(stats.totalRevenue)} subtitle={`${stats.totalSold || 0} unidades vendidas`} />
            <StatsCard title="Productos" value={stats.totalProducts || 0} subtitle={stats.outOfStockMine ? `${stats.outOfStockMine} agotados` : 'En tu vitrina'} />
            <StatsCard title="Sin reseñas" value={stats.productsWithoutReviews || 0} subtitle="Pide opinión a tus compradores" />
          </>
        )}
        {user.role === 'buyer' && (
          <>
            <StatsCard title="Total gastado" value={`$${data.stats?.totalSpent?.toLocaleString() || 0}`} subtitle="Historico" />
            <StatsCard title="Pedidos" value={data.stats?.totalOrders || 0} subtitle={`${data.stats?.pendingOrders || 0} pendientes`} />
          </>
        )}
      </div>

      {/* Quick Actions - Buyer */}
      {user.role === 'buyer' && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link to="/productos" className="btn accent">Explorar catálogo</Link>
          <Link to="/dashboard/pedidos" className="btn secondary">Mis pedidos</Link>
          <Link to="/dashboard/mi-perfil" className="btn secondary">Mi perfil / Dirección de envío</Link>
        </div>
      )}

      {/* Quick Actions - SuperAdmin (solo accesos globales/plataforma) */}
      {user.role === 'superadmin' && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard/artesanos" className="btn accent">Gestionar artesanos</Link>
          <Link to="/dashboard/pedidos" className="btn secondary">Pedidos globales</Link>
          <Link to="/dashboard/productos" className="btn secondary">Productos (moderación)</Link>
        </div>
      )}

      {/* Quick Actions - Admin (operación diaria de plataforma) */}
      {user.role === 'admin' && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard/productos" className="btn accent">Gestionar productos</Link>
          <Link to="/dashboard/pedidos" className="btn secondary">Ver pedidos</Link>
          <Link to="/dashboard/inventario" className="btn secondary">Inventario</Link>
          <Link to="/dashboard/artesanos" className="btn secondary">Gestionar artesanos</Link>
        </div>
      )}
      {user.role === 'artisan' && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard/productos" className="btn accent">Mis productos</Link>
          <Link to="/dashboard/pedidos" className="btn secondary">Pedidos</Link>
          <Link to="/dashboard/inventario" className="btn secondary">Inventario</Link>
          <Link to="/dashboard/finanzas" className="btn secondary">Finanzas</Link>
          <Link to="/dashboard/promociones" className="btn secondary">Promociones</Link>
          <Link to="/dashboard/perfil-negocio" className="btn secondary">Mi negocio</Link>
        </div>
      )}

      {/* Monthly Sales Chart */}
      {monthlySales.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Ventas mensuales</h2>
          <div className="card" style={{ padding: '1.5rem' }}>
            <ResponsiveContainer width="100%" height={280}>
              {user.role === 'artisan' ? (
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                  <Line type="monotone" dataKey="total" stroke="#e8833a" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                  <Bar dataKey="total" fill="#e8833a" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Inventory Summary for Artisan */}
      {user.role === 'artisan' && data.inventorySummary?.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Resumen de inventario</h2>
            <Link to="/dashboard/inventario" className="btn secondary" style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}>Ver detalle</Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <Table
              columns={[
                { key: 'title', label: 'Producto', render: (r) => <span style={{ fontWeight: 500 }}>{r.title}</span> },
                { key: 'stock', label: 'En stock', render: (r) => (
                  <span style={{ fontWeight: 600, color: r.stock === 0 ? 'var(--error)' : r.stock <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                    {r.stock}
                  </span>
                )},
                { key: 'soldCount', label: 'Vendidos', render: (r) => r.soldCount || 0 },
                { key: 'promo', label: 'Promoción', render: (r) => r.isPromotion
                  ? <span style={{ color: 'var(--error)', fontWeight: 600 }}>${r.promotionPrice}</span>
                  : <span className="muted">-</span>
                },
              ]}
              data={data.inventorySummary.slice(0, 10)}
              emptyMessage="Sin productos"
            />
          </div>
        </section>
      )}

      {/* Top Products */}
      {data.topProducts?.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Productos más vendidos</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <Table
              columns={[
                { key: 'title', label: 'Producto', render: (r) => <span style={{ fontWeight: 500 }}>{r.title}</span> },
                { key: 'price', label: 'Precio', render: (r) => `$${r.price}` },
                { key: 'soldCount', label: 'Vendidos', render: (r) => r.soldCount || 0 },
                { key: 'stock', label: 'Stock', render: (r) => (
                  <span style={{ color: r.stock <= 5 ? 'var(--error)' : 'var(--text)', fontWeight: r.stock <= 5 ? 700 : 400 }}>{r.stock}</span>
                )},
              ]}
              data={data.topProducts}
              emptyMessage="Sin productos aún"
            />
          </div>
        </section>
      )}

      {/* Recent Orders */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Pedidos recientes</h2>
          <Link to="/dashboard/pedidos" className="btn secondary" style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}>Ver todos</Link>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={orderColumns}
            data={data.recentOrders || []}
            emptyMessage="Sin pedidos aún"
          />
        </div>
      </section>

      {/* Low Stock Alerts */}
      {(data.inventory?.alerts?.length > 0 || data.inventory?.lowStock?.length > 0) && (
        <section className="section">
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Alertas de inventario</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderColor: 'var(--error)', borderWidth: '1px' }}>
            <Table
              columns={[
                { key: 'title', label: 'Producto', render: (r) => <span style={{ fontWeight: 500 }}>{r.title}</span> },
                { key: 'stock', label: 'Stock actual', render: (r) => (
                  <span style={{ color: 'var(--error)', fontWeight: 700 }}>{r.stock}</span>
                )},
                { key: 'action', label: '', render: () => (
                  <Link to="/dashboard/inventario" className="btn accent" style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>Reponer</Link>
                )},
              ]}
              data={data.inventory.alerts || data.inventory.lowStock}
            />
          </div>
        </section>
      )}
    </main>
  );
}
