import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fetchTaskDetails = async () => {
    try {
      const [taskRes, updatesRes] = await Promise.all([
        api.get(`/api/tasks/${id}/`),
        api.get(`/api/tasks/${id}/updates/`)
      ]);
      setTask(taskRes.data);
      setUpdates(updatesRes.data);
    } catch (err) {
      alert('Error fetching task details');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/api/tasks/${id}/`, { status: newStatus });
      setTask({ ...task, status: newStatus });
      alert('Status updated!');
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    try {
      const response = await api.post(`/api/tasks/${id}/add-update/`, { message: newUpdate });
      setUpdates([response.data, ...updates]);
      setNewUpdate('');
    } catch (err) {
      alert('Error adding update');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><p>Loading Task details...</p></div>;
  if (!task) return <div className="card" style={{ textAlign: 'center' }}>Task not found</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/tasks')} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--primary)', 
          cursor: 'pointer', 
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600'
        }}
      >
        <span>←</span> Return to Assignments
      </button>

      <div className="card" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="status-badge" style={{ background: 'var(--accent-light)', color: 'var(--primary)', fontSize: '11px' }}>
                {task.project_title}
              </span>
              <span className={`status-badge status-${task.status.toLowerCase().replace('_', '')}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{task.title}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Due Date: <strong>{task.due_date}</strong></p>
          </div>
          <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: 'none', marginBottom: 0 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '12px', color: 'var(--primary)', textTransform: 'uppercase' }}>Update Status</label>
            <select 
              className="input" 
              style={{ width: '180px', marginBottom: '0' }}
              value={task.status} 
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '24px', paddingTop: '32px', borderTop: '1px solid rgba(138, 98, 98, 0.1)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Task Description</h3>
          <p style={{ color: 'var(--text-main)', fontSize: '16px', whiteSpace: 'pre-wrap' }}>{task.description || 'No detailed description provided for this task.'}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Timeline & Collaboration</h3>
        
        <form onSubmit={handleAddUpdate} style={{ marginBottom: '40px' }}>
          <div style={{ position: 'relative' }}>
            <textarea 
              className="input" 
              placeholder="What's the current progress? Type an update..."
              style={{ minHeight: '120px', padding: '20px', borderRadius: '16px' }}
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-primary" type="submit">Post Status Update</button>
            </div>
          </div>
        </form>

        <div className="updates-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {updates.length > 0 ? (
            updates.map((update, idx) => (
              <div key={idx} style={{ 
                padding: '24px', 
                background: 'var(--surface)', 
                borderRadius: '16px',
                border: '1px solid rgba(138, 98, 98, 0.05)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{update.user_name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(update.created_at).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6' }}>{update.message}</p>
              </div>
            ))
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No progress updates recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;

