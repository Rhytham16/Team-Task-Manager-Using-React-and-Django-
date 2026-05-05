import { Navigate } from 'react-router-dom';
import { getTokenRole, isAdminRole } from '../auth';

function AdminRoute({ children }) {
  const role = getTokenRole();
  if (!isAdminRole(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default AdminRoute;

