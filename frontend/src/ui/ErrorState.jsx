import { Link } from 'react-router-dom';

const AlertIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export default function ErrorState({ title = 'Algo salio mal', message = 'No pudimos cargar la informacion', onRetry, backTo, backLabel = 'Volver al inicio' }) {
  return (
    <div className="empty-state" role="alert">
      <AlertIcon />
      <h3>{title}</h3>
      <p className="muted">{message}</p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <button className="btn accent" onClick={onRetry}>
            Intentar de nuevo
          </button>
        )}
        {backTo && (
          <Link to={backTo} className="btn secondary">
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
