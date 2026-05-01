import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const RoleRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cada ruta declara explícitamente los roles permitidos. Sin bypass para
  // ningún rol — incluido superadmin — para reflejar la separación de
  // responsabilidades del backend (RolesGuard).
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
