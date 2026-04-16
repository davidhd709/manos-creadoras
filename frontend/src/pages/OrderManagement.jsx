import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../ui/Toast';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const STATUS_FLOW = {
  pendiente: ['en_proceso', 'cancelado'],
  en_proceso: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
};

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export default function OrderManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(false);
    const endpoint =
      user.role === 'admin' ? '/orders' :
      user.role === 'artisan' ? '/orders/artisan' :
      '/orders/my';

    api.get(endpoint)
      .then(({ data }) => setOrders(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Pedido actualizado a "${STATUS_LABELS[newStatus] || newStatus}"`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  if (!user) return <div className="page"><div className="empty-state"><h3>Inicia sesion</h3><Link to="/login" className="btn accent" style={{ marginTop: '1rem' }}>Iniciar sesion</Link></div></div>;
  if (loading) return <Spinner />;
  if (error) return <div className="page"><ErrorState title="Error al cargar pedidos" message="No pudimos obtener la lista de pedidos." onRetry={fetchOrders} backTo="/dashboard" backLabel="Volver al dashboard" /></div>;

  return (
    <main className="page" role="main">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>Pedidos</span>
      </nav>

      <div className="section-header">
        <div>
          <h1 className="section-title">Gestion de pedidos</h1>
          <p className="section-subtitle">{orders.length} pedidos en total</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`btn ${!filter ? 'accent' : 'secondary'}`} style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }} onClick={() => setFilter('')}>
          Todos ({orders.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = orders.filter((o) => o.status === key).length;
          return (
            <button
              key={key}
              className={`btn ${filter === key ? 'accent' : 'secondary'}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}
              onClick={() => setFilter(key)}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.25rem' }}>
        <Table
          columns={[
            { key: 'id', label: 'ID', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>#{(r._id || '').slice(-6)}</span> },
            { key: 'buyer', label: 'Cliente', render: (r) => r.buyer?.name || r.buyer || '-' },
            { key: 'items', label: 'Productos', render: (r) => r.items?.length || 0 },
            { key: 'total', label: 'Total', render: (r) => <span style={{ fontWeight: 600 }}>${r.totalOrder?.toLocaleString()}</span> },
            { key: 'status', label: 'Estado', render: (r) => <StatusBadge status={r.status} /> },
            ...(user.role !== 'buyer' ? [{
              key: 'actions',
              label: 'Acciones',
              render: (r) => {
                const nextStates = STATUS_FLOW[r.status] || [];
                if (nextStates.length === 0) return <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Finalizado</span>;
                return (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {nextStates.map((s) => (
                      <button
                        key={s}
                        className={`btn ${s === 'cancelado' ? '' : 'secondary'}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.3rem 0.65rem',
                          ...(s === 'cancelado' ? { background: 'var(--error)' } : {}),
                        }}
                        onClick={() => updateStatus(r._id, s)}
                      >
                        {STATUS_LABELS[s] || s}
                      </button>
                    ))}
                  </div>
                );
              },
            }] : []),
            {
              key: 'detail',
              label: '',
              render: (r) => (
                <button className="btn secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }} onClick={() => setSelectedOrder(r)}>
                  Detalle
                </button>
              ),
            },
          ]}
          data={filtered}
          emptyMessage="Sin pedidos"
        />
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Pedido #${(selectedOrder?._id || '').slice(-6)}`}>
        {selectedOrder && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted">Estado</span>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Cliente</span>
              <span style={{ fontWeight: 500 }}>{selectedOrder.buyer?.name || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${selectedOrder.totalOrder?.toLocaleString()}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />
            <div>
              <h4 style={{ margin: '0 0 0.75rem', fontWeight: 600 }}>Productos del pedido</h4>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
                  <span>{item.product?.title || 'Producto eliminado'} <span className="muted">x{item.quantity}</span></span>
                  <span style={{ fontWeight: 600 }}>${item.totalItem?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
