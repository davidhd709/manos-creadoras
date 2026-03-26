import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import StatsCard from '../components/StatsCard';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';

const ROLE_TITLES = {
  admin: 'Panel de Administracion',
  artisan: 'Panel de Artesano',
  buyer: 'Mi Panel',
};

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const endpoint =
      user.role === 'admin'
        ? '/dashboard/admin'
        : user.role === 'artisan'
          ? '/dashboard/artisan'
          : '/dashboard/buyer';

    api.get(endpoint)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Error al cargar el dashboard'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="page" role="alert"><div className="empty-state"><h3>Inicia sesion para ver tu dashboard</h3><Link to="/login" className="btn accent" style={{ marginTop: '1rem' }}>Iniciar sesion</Link></div></div>;
  if (loading) return <Spinner />;
  if (!data) return <div className="page"><div className="empty-state"><h3>Error al cargar datos</h3></div></div>;

  const orderColumns = [
    { key: 'id', label: 'ID', render: (row) => <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>#{(row._id || '').slice(-6)}</span> },
    { key: 'status', label: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'total', label: 'Total', render: (row) => <span style={{ fontWeight: 600 }}>${row.totalOrder?.toLocaleString()}</span> },
    { key: 'items', label: 'Productos', render: (row) => row.items?.length || 0 },
  ];

  return (
    <main className="page" role="main">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">{ROLE_TITLES[user.role] || 'Dashboard'}</h1>
          <p className="section-subtitle">Bienvenido, {user.name || 'usuario'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {user.role === 'admin' && (
          <>
            <StatsCard title="Ingresos totales" value={`$${data.stats.totalRevenue?.toLocaleString()}`} subtitle="Total acumulado" />
            <StatsCard title="Pedidos" value={data.stats.totalOrders} subtitle={`${data.stats.pendingOrders} pendientes`} />
            <StatsCard title="Productos" value={data.stats.totalProducts} subtitle={`${data.inventory?.lowStock || 0} bajo stock`} />
            <StatsCard title="Usuarios" value={data.stats.totalUsers} subtitle={`${data.stats.totalArtisans} artesanos, ${data.stats.totalBuyers} compradores`} />
          </>
        )}
        {user.role === 'artisan' && (
          <>
            <StatsCard title="Ingresos estimados" value={`$${data.stats.totalRevenue?.toLocaleString()}`} subtitle="Total ventas" />
            <StatsCard title="Productos" value={data.stats.totalProducts} subtitle="En tu vitrina" />
            <StatsCard title="Unidades vendidas" value={data.stats.totalSold} subtitle="Total historico" />
            <StatsCard title="Alertas inventario" value={data.stats.lowStockAlerts} subtitle="Productos bajo stock" />
          </>
        )}
        {user.role === 'buyer' && (
          <>
            <StatsCard title="Total gastado" value={`$${data.stats.totalSpent?.toLocaleString()}`} subtitle="Historico" />
            <StatsCard title="Pedidos" value={data.stats.totalOrders} subtitle={`${data.stats.pendingOrders} pendientes`} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      {(user.role === 'artisan' || user.role === 'admin') && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard/productos" className="btn accent">Gestionar productos</Link>
          <Link to="/dashboard/pedidos" className="btn secondary">Ver pedidos</Link>
          <Link to="/dashboard/inventario" className="btn secondary">Inventario</Link>
        </div>
      )}

      {/* Monthly Sales Chart */}
      {user.role === 'admin' && data.monthlySales?.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Ventas mensuales</h2>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 200 }}>
              {data.monthlySales.slice().reverse().map((m) => {
                const maxTotal = Math.max(...data.monthlySales.map((s) => s.total));
                const height = maxTotal > 0 ? (m.total / maxTotal) * 160 : 0;
                return (
                  <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>${(m.total / 1000).toFixed(0)}k</span>
                    <div
                      style={{
                        height,
                        width: '100%',
                        background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-dark) 100%)',
                        borderRadius: '6px 6px 0 0',
                        minHeight: 4,
                        transition: 'height 0.5s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>{m.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Top Products */}
      {data.topProducts?.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Productos mas vendidos</h2>
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
              emptyMessage="Sin productos aun"
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
            data={data.recentOrders}
            emptyMessage="Sin pedidos aun"
          />
        </div>
      </section>

      {/* Low Stock Alerts */}
      {data.inventory?.alerts?.length > 0 && (
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
              data={data.inventory.alerts}
            />
          </div>
        </section>
      )}
    </main>
  );
}
