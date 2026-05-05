import { Navigate } from 'react-router-dom';
import { getTokenRole, isAdminRole } from '../auth';

function RoleBasedHome({ children }) {
  const role = getTokenRole();
  if (isAdminRole(role)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default RoleBasedHome;

