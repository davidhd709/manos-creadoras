import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastCtx.Provider value={{ success, error, info }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.filter((t) => t.type !== 'error').map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="toast-dismiss" aria-label="Cerrar notificación">&times;</button>
          </div>
        ))}
      </div>
      <div className="toast-container" role="alert" aria-live="assertive">
        {toasts.filter((t) => t.type === 'error').map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="toast-dismiss" aria-label="Cerrar notificación">&times;</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

export const useToast = () => useContext(ToastCtx);
