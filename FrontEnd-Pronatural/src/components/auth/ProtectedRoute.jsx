import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_PREFIX } from '../../config';
export default function ProtectedRoute({ children, allowedRoles, authFallback = '/register' }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-dark font-sans text-xs tracking-widest font-bold uppercase">
        Verificando credenciales...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to={authFallback} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'Admin') {
      return <Navigate to={ADMIN_PREFIX} replace />;
    }
    if (user?.role === 'Employee') {
      return <Navigate to="/vendedor" replace />;
    }
    return <Navigate to="/catalogo" replace />;
  }
  return children;
}
