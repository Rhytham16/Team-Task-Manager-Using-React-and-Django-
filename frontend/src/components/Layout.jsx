import { Link, useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error("Failed to parse user data", e);
    }
    return {};
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>
          <span style={{ fontSize: '28px' }}>🏠</span>
          Team-Task-Manager
        </h2>

        <div className="sidebar-nav">
          <Link to="/" className={isActive('/')}>Dashboard Overview</Link>
          <Link to="/projects" className={isActive('/projects')}>All Projects</Link>
          <Link to="/tasks" className={isActive('/tasks')}>My Assignments</Link>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid rgba(138, 98, 98, 0.1)' }}>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Logged in as</p>
            <p style={{ fontWeight: '700', color: 'var(--primary)' }}>{user.name || user.email || 'User'}</p>
            <span className="status-badge" style={{
              fontSize: '10px',
              padding: '4px 8px',
              marginTop: '8px',
              display: 'inline-block',
              background: user.role === 'ADMIN' ? 'var(--accent-light)' : '#f3f4f6',
              color: user.role === 'ADMIN' ? 'var(--primary)' : '#4b5563'
            }}>
              {user.role === 'ADMIN' ? 'Administrator' : 'Team Member'}
            </span>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
            Logout Session
          </button>
        </div>
      </div>

      <div className="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;

