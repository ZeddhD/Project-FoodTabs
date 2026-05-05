import { useAuthStore } from '../context/store';
import { Navigate } from 'react-router-dom';

// customerOnly — redirects admin/owner away to their respective homes
export const ProtectedRoute = ({ children, requiredRole = null, customerOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Admin trying to access owner-only or customer-only page
  if (customerOnly && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  if (customerOnly && user?.role === 'owner') {
    return <Navigate to="/owner/dashboard" />;
  }

  // Role-restricted route (e.g. owner-only)
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
