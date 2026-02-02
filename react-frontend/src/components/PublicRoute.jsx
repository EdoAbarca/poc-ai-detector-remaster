import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * PublicRoute component that prevents authenticated users from accessing
 * Redirects to dashboard if user is already authenticated
 */
function PublicRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to="/logged-in" replace />;
  }

  return children;
}

export default PublicRoute;
