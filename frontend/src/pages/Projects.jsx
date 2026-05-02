import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'ADMIN';

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects/');
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/projects/', { name: title, description });
      setTitle('');
      setDescription('');
      setShowForm(false);
      fetchProjects();
      alert('Project created successfully!');
    } catch (err) {
      alert('Error creating project');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><p>Loading Projects...</p></div>;

  return (
    <div className="projects-view">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>Project Workspace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your team's initiatives and high-level goals.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Discard Project' : '✨ Start New Project'}
          </button>
        )}
      </header>

      {showForm && (
        <div className="card" style={{ marginBottom: '48px', border: '2px solid var(--accent-light)' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Draft a New Project</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Project Identity</label>
              <input 
                type="text" 
                className="input" 
                placeholder="e.g. Q3 Marketing Sprint"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Purpose & Description</label>
              <textarea 
                className="input" 
                style={{ minHeight: '120px', resize: 'vertical' }}
                placeholder="Define the scope and objectives of this project..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-primary" type="submit">Initialize Project</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel Draft</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
        {projects.map(project => (
          <div key={project.id} className="card project-card" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{project.title}</h3>
            <p style={{ 
              color: 'var(--text-muted)', 
              fontSize: '14px',
              marginBottom: '24px',
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{project.description}</p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '20px',
              borderTop: '1px solid rgba(138, 98, 98, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📋</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>{project.task_count || 0} Tasks</span>
              </div>
              <Link to={`/projects/${project.id}`} className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px', textDecoration: 'none' }}>
                Manage Project
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: '24px', border: '1px dashed rgba(138, 98, 98, 0.2)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>No projects found in the workspace.</p>
        </div>
      )}
    </div>
  );
}

export default Projects;

