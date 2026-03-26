const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  en_proceso: { label: 'En proceso', bg: 'bg-blue-100', text: 'text-blue-800' },
  enviado: { label: 'Enviado', bg: 'bg-purple-100', text: 'text-purple-800' },
  entregado: { label: 'Entregado', bg: 'bg-green-100', text: 'text-green-800' },
  cancelado: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-800' },
  // Legacy support
  pending: { label: 'Pendiente', bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
