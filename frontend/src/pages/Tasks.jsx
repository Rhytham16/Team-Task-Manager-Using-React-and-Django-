import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const isAdmin = user.role === 'ADMIN';

  const fetchData = async () => {
    try {
      const response = await api.get(`/api/tasks/?assigned_to=${user.id}`);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><p>Loading Assignments...</p></div>;

  return (
    <div className="tasks-view">
      <header style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>My Assignments</h1>
        <p style={{ color: 'var(--text-muted)' }}>Tracks all tasks assigned to your profile across all projects.</p>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(138, 98, 98, 0.1)', background: 'rgba(138, 98, 98, 0.02)' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Active Task List</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Task Details</th>
                <th>Project Workspace</th>
                <th>Current Status</th>
                <th>Collaborators</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map(task => (
                <tr key={task.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{task.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due: {task.due_date}</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: 'var(--accent-light)', color: 'var(--primary)', fontSize: '11px' }}>
                      {task.project_title}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${task.status.toLowerCase().replace('_', '')}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {task.assigned_to?.map(u => u.name).join(', ') || 'Unassigned'}
                  </td>
                  <td>
                    <Link to={`/tasks/${task.id}`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 16px', textDecoration: 'none' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tasks.length === 0 && (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '16px' }}>No tasks are currently assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;

