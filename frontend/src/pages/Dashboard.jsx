import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedMember, setSelectedMember] = useState(null);
  const [memberTasks, setMemberTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/dashboard/');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleViewTasks = async (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
    setLoadingTasks(true);
    try {
      const response = await api.get(`/api/tasks/?assigned_to=${member.id}`);
      setMemberTasks(response.data);
    } catch (err) {
      console.error('Error fetching member tasks');
      alert('Error fetching tasks for this member.');
    } finally {
      setLoadingTasks(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setMemberTasks([]);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><p>Loading Dashboard...</p></div>;
  if (error) return <div className="card" style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div className="dashboard-view">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>Workplace Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back! Here is what's happening today.</p>
      </header>

      {/* Admin Stats Section */}
      {data?.global_stats && (
        <section style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <h2 style={{ margin: 0, fontSize: '22px' }}>Administrative Oversight</h2>
          </div>
          
          <div className="stats-grid">
            <div className="card stat-card">
              <span className="stat-label">Team Members</span>
              <div className="stat-value">{data.global_stats.total_members}</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Total Projects</span>
              <div className="stat-value">{data.global_stats.total_projects}</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Active Tasks</span>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{data.global_stats.total_tasks}</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Pending (TODO)</span>
              <div className="stat-value" style={{ color: 'var(--progress-text)' }}>{data.global_stats.TODO}</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Completed</span>
              <div className="stat-value" style={{ color: 'var(--completed-text)' }}>{data.global_stats.COMPLETED}</div>
            </div>
          </div>

          {data.recent_global_tasks && data.recent_global_tasks.length > 0 && (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(138, 98, 98, 0.1)', background: 'rgba(138, 98, 98, 0.02)' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Recent Global Activity</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Latest Interaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_global_tasks.map(task => {
                      const latestUpdate = task.updates && task.updates.length > 0 ? task.updates[0] : null;
                      return (
                        <tr key={task.id}>
                          <td style={{ fontWeight: '600' }}>{task.title}</td>
                          <td>{task.project_title}</td>
                          <td>
                            <span className={`status-badge status-${task.status.toLowerCase().replace('_', '')}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            {latestUpdate ? (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{latestUpdate.user.name}</span>
                                <span style={{ fontSize: '12px', opacity: 0.8 }}>{latestUpdate.message}</span>
                              </div>
                            ) : (
                              <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No recent updates</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Personal Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{ fontSize: '24px' }}>👤</span>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Personal Assignments</h2>
        </div>
        
        <div className="stats-grid">
          <div className="card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <span className="stat-label">Assigned to You</span>
            <div className="stat-value">{data?.my_stats?.total || 0}</div>
          </div>
          <div className="card stat-card" style={{ borderLeft: '4px solid var(--progress-text)' }}>
            <span className="stat-label">To Do</span>
            <div className="stat-value" style={{ color: 'var(--progress-text)' }}>{data?.my_stats?.TODO || 0}</div>
          </div>
          <div className="card stat-card" style={{ borderLeft: '4px solid var(--primary-light)' }}>
            <span className="stat-label">In Progress</span>
            <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{data?.my_stats?.IN_PROGRESS || 0}</div>
          </div>
          <div className="card stat-card" style={{ borderLeft: '4px solid var(--completed-text)' }}>
            <span className="stat-label">Completed</span>
            <div className="stat-value" style={{ color: 'var(--completed-text)' }}>{data?.my_stats?.COMPLETED || 0}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginTop: '40px' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(138, 98, 98, 0.1)', background: 'rgba(138, 98, 98, 0.02)' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Your Recent Tasks</h3>
            </div>
            {data?.my_assigned_tasks?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.my_assigned_tasks.map(task => (
                      <tr key={task.id}>
                        <td style={{ fontWeight: '600' }}>{task.title}</td>
                        <td>{task.project_title}</td>
                        <td>
                          <span className={`status-badge status-${task.status.toLowerCase().replace('_', '')}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No tasks currently assigned to you.</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>My Active Projects</h3>
            {data?.my_projects?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.my_projects.map(project => (
                  <Link 
                    key={project.id} 
                    to={`/projects/${project.id}`} 
                    style={{ 
                      textDecoration: 'none', 
                      display: 'block',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'var(--surface)',
                      border: '1px solid rgba(138, 98, 98, 0.1)',
                      color: 'var(--primary)',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    {project.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>You are not included in any projects yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Shared Task Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(45, 36, 36, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '24px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedMember?.name}'s History</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Global task overview for this member</p>
              </div>
              <button className="btn btn-secondary" onClick={closeModal}>Close View</button>
            </div>
            
            {loadingTasks ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Loading historical data...</div>
            ) : memberTasks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No task history found for this member.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {memberTasks.map(task => (
                  <div key={task.id} style={{ border: '1px solid rgba(138, 98, 98, 0.1)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '4px' }}>{task.title}</h4>
                        <span className="status-badge" style={{ fontSize: '10px' }}>{task.project_title}</span>
                      </div>
                      <span className={`status-badge status-${task.status.toLowerCase().replace('_', '')}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{task.description}</p>
                    
                    {task.updates && task.updates.length > 0 && (
                      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(138, 98, 98, 0.05)', paddingTop: '16px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase' }}>Recent Updates</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {task.updates.slice(0, 2).map(update => (
                            <div key={update.id} style={{ fontSize: '13px', background: 'var(--surface)', padding: '12px', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600' }}>{update.user.name}</span>
                                <span style={{ fontSize: '11px', opacity: 0.6 }}>{new Date(update.created_at).toLocaleDateString()}</span>
                              </div>
                              <span style={{ color: 'var(--text-muted)' }}>{update.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

