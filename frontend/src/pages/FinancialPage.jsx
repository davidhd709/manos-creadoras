import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import StatsCard from '../components/StatsCard';
import Table from '../components/Table';

const COLORS = ['#e8833a', '#f5a623', '#7cb342', '#42a5f5', '#ab47bc', '#ef5350', '#26c6da', '#8d6e63'];

export default function FinancialPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/artisan')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Error al cargar datos financieros'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <div className="page"><div className="empty-state"><h3>Error al cargar datos</h3></div></div>;

  const monthlySales = (data.monthlySales || []).slice().reverse();
  const revenueByProduct = data.revenueByProduct || [];
  const avgOrderValue = data.stats.totalOrders > 0
    ? Math.round(data.stats.totalRevenue / data.stats.totalOrders)
    : 0;

  return (
    <main className="page" role="main">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>Finanzas</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Panel financiero</h1>
          <p className="section-subtitle">Analisis de ingresos y ventas de tu negocio</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '1.5rem' }}>
        <StatsCard title="Ingresos totales" value={`$${data.stats.totalRevenue?.toLocaleString()}`} subtitle="Total acumulado" />
        <StatsCard title="Total pedidos" value={data.stats.totalOrders} subtitle="Ordenes recibidas" />
        <StatsCard title="Unidades vendidas" value={data.stats.totalSold} subtitle="Total historico" />
        <StatsCard title="Ticket promedio" value={`$${avgOrderValue.toLocaleString()}`} subtitle="Valor por pedido" />
      </div>

      {/* Revenue Chart */}
      {monthlySales.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Ingresos mensuales</h2>
          <div className="card" style={{ padding: '1.5rem' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                <Bar dataKey="total" fill="#e8833a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Revenue by Product Table */}
        {revenueByProduct.length > 0 && (
          <section className="section">
            <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Ingresos por producto</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <Table
                columns={[
                  { key: 'product', label: 'Producto', render: (r) => <span style={{ fontWeight: 500 }}>{r.productTitle}</span> },
                  { key: 'sold', label: 'Vendidos', render: (r) => r.totalSold },
                  { key: 'revenue', label: 'Ingresos', render: (r) => <span style={{ fontWeight: 600, color: 'var(--success)' }}>${r.totalRevenue?.toLocaleString()}</span> },
                ]}
                data={revenueByProduct}
                emptyMessage="Sin datos"
              />
            </div>
          </section>
        )}

        {/* Revenue Pie Chart */}
        {revenueByProduct.length > 0 && (
          <section className="section">
            <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Distribucion de ingresos</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByProduct.slice(0, 8)}
                    dataKey="totalRevenue"
                    nameKey="productTitle"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ productTitle, percent }) => `${productTitle?.slice(0, 15)} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {revenueByProduct.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
