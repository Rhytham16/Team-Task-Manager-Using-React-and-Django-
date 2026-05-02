import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMember, setSelectedMember] = useState(null);
  const [memberTasks, setMemberTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskUpdateInputs, setTaskUpdateInputs] = useState({});

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assigningMembers, setAssigningMembers] = useState([]);

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
      const [projectRes, usersRes] = await Promise.all([
        api.get(`/api/projects/${id}/`),
        isAdmin ? api.get('/api/users/') : Promise.resolve({ data: [] })
      ]);
      setProject(projectRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddMember = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      await Promise.all(
        selectedUserIds?.map(userId => 
          api.post(`/api/projects/${id}/add-member/`, { user_id: userId })
        )
      );
      alert('Members added successfully!');
      setSelectedUserIds([]);
      setShowAddMembers(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding members');
    }
  };

  const handleViewTasks = async (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
    setLoadingTasks(true);
    try {
      const response = await api.get(`/api/tasks/?project=${id}&assigned_to=${member.id}`);
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
    setTaskUpdateInputs({});
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/`, { status: newStatus });
      setMemberTasks(memberTasks?.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Error updating status';
      alert(`Status Update Failed: ${msg}`);
    }
  };

  const handleTaskAddUpdate = async (e, taskId) => {
    e.preventDefault();
    const message = taskUpdateInputs[taskId];
    if (!message || !message.trim()) return;

    try {
      const response = await api.post(`/api/tasks/${taskId}/add-update/`, { message });
      setMemberTasks(memberTasks?.map(t => {
        if (t.id === taskId) {
          return { ...t, updates: [response.data, ...(t.updates || [])] };
        }
        return t;
      }));
      setTaskUpdateInputs({ ...taskUpdateInputs, [taskId]: '' });
    } catch (err) {
      alert('Error adding update');
    }
  };

  const handleOpenAssignModal = () => {
    setAssigningMembers([]);
    setAssignTitle('');
    setAssignDesc('');
    setAssignDueDate('');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (assigningMembers.length === 0) {
      alert('Please select at least one member to assign the task to.');
      return;
    }
    try {
      await api.post('/api/tasks/', {
        title: assignTitle,
        description: assignDesc,
        project: id,
        assigned_to: assigningMembers,
        due_date: assignDueDate
      });
      alert('Task assigned successfully!');
      setIsAssignModalOpen(false);
      setAssigningMembers([]);
    } catch (err) {
      alert(err.response?.data?.error || 'Error assigning task');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.post(`/api/projects/${id}/remove-member/`, { user_id: memberId });
      alert('Member removed successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error removing member');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this ENTIRE project and all its tasks? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/projects/${id}/`);
      alert('Project deleted successfully.');
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting project');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}/`);
      setMemberTasks(memberTasks.filter(t => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting task');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><p>Loading Project Environment...</p></div>;
  if (!project) return <div className="card" style={{ textAlign: 'center', color: 'red' }}>Project Workspace not found.</div>;

  return (
    <div className="project-details-view">
      <header style={{ marginBottom: '40px' }}>
        <Link to="/projects" style={{ 
          color: 'var(--primary)', 
          textDecoration: 'none', 
          fontWeight: '600', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '24px'
        }}>
          <span>←</span> Back to Project Directory
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>{project.title}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Created by <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{project.created_by?.name || 'Unknown'}</span></p>
          </div>
          {isAdmin && (
            <button 
              className="btn" 
              style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
              onClick={handleDeleteProject}
            >
              Destroy Project
            </button>
          )}
        </div>
      </header>

      <div className="card" style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--primary)' }}>Project Abstract</h3>
        <p style={{ color: 'var(--text-main)', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{project.description}</p>
      </div>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>👥</span>
            <h2 style={{ margin: 0, fontSize: '22px' }}>Team Workspace</h2>
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={handleOpenAssignModal}>
                ⚡ Assign New Task
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAddMembers(!showAddMembers)}>
                {showAddMembers ? 'Discard Member Selection' : '➕ Add Members'}
              </button>
            </div>
          )}
        </div>
        
        {isAdmin && showAddMembers && (
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--accent-light)', marginBottom: '32px' }}>
            <h4 style={{ marginBottom: '16px' }}>Select Members to Join</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {allUsers?.filter(u => !project.team_members.some(m => m.id === u.id))
                ?.map(u => (
                  <label key={u.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px', 
                    background: 'white', 
                    borderRadius: '12px',
                    border: selectedUserIds.includes(u.id) ? '2px solid var(--primary)' : '1px solid rgba(138, 98, 98, 0.1)',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      style={{ width: '18px', height: '18px' }}
                      checked={selectedUserIds.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds([...selectedUserIds, u.id]);
                        } else {
                          setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                        }
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.role}</span>
                    </div>
                  </label>
                ))}
              {allUsers.filter(u => !project.team_members.some(m => m.id === u.id)).length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>All team members are already present in this project.</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={handleAddMember} disabled={selectedUserIds.length === 0}>Add Selected Members</button>
              <button className="btn btn-secondary" onClick={() => setShowAddMembers(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {project?.team_members?.map(member => (
            <div key={member.id} className="card" style={{ 
              marginBottom: 0, 
              padding: '24px', 
              background: 'var(--surface)', 
              border: '1px solid rgba(138, 98, 98, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '4px' }}>{member.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{member.email}</p>
                </div>
                {isAdmin && member.id !== user.id && (
                  <button 
                    style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                {(isAdmin || user.id === member.id) && (
                  <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px' }} onClick={() => handleViewTasks(member)}>
                    View Personal Tasks
                  </button>
                )}
              </div>
            </div>
          ))}
          {project.team_members.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', border: '1px dashed var(--accent)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No members have been assigned to this workspace yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* View Tasks Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(45, 36, 36, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '24px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedMember?.name}'s Project Tasks</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Managing assignments in {project.title}</p>
              </div>
              <button className="btn btn-secondary" onClick={closeModal}>Close Workspace</button>
            </div>
            
            {loadingTasks ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Synchronizing tasks...</div>
            ) : memberTasks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks assigned in this project context.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {memberTasks?.map(task => (
                  <div key={task.id} style={{ border: '1px solid rgba(138, 98, 98, 0.1)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '18px', color: 'var(--primary)' }}>{task.title}</h4>
                          {user.id === selectedMember?.id || isAdmin ? (
                            <select 
                              className="input" 
                              style={{ width: 'auto', marginBottom: 0, padding: '4px 12px', fontSize: '11px', height: 'auto', background: 'var(--accent-light)' }}
                              value={task.status} 
                              onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          ) : (
                            <span className={`status-badge status-${task.status.toLowerCase().replace('_', '')}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Deadline: {task.due_date}</p>
                      </div>
                      {isAdmin && (
                        <button 
                          style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '20px', lineHeight: '1.5' }}>{task.description}</p>
                    
                    {(user.id === selectedMember?.id || isAdmin) && (
                      <form 
                        onSubmit={(e) => handleTaskAddUpdate(e, task.id)} 
                        style={{ display: 'flex', gap: '12px', marginTop: '20px', padding: '16px', background: 'var(--surface)', borderRadius: '12px' }}
                      >
                        <input 
                          type="text" 
                          className="input" 
                          style={{ marginBottom: 0, flex: 1, padding: '10px 16px', fontSize: '13px' }}
                          placeholder="Post a progress update..."
                          value={taskUpdateInputs[task.id] || ''}
                          onChange={(e) => setTaskUpdateInputs({ ...taskUpdateInputs, [task.id]: e.target.value })}
                          required
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', fontSize: '13px' }}>
                          Send
                        </button>
                      </form>
                    )}

                    {task.updates && task.updates.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px' }}>Communication Thread</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {task?.updates?.slice(0, 3)?.map(update => (
                            <div key={update.id} style={{ fontSize: '13px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid rgba(138, 98, 98, 0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{update.user.name}</span>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>{new Date(update.created_at).toLocaleDateString()}</span>
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

      {/* Assign Task Modal */}
      {isAssignModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(45, 36, 36, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '24px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0 }}>Define New Assignment</h2>
              <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Discard</button>
            </div>
            
            <form onSubmit={handleAssignSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Assignment Title</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Design System Documentation"
                  value={assignTitle} 
                  onChange={(e) => setAssignTitle(e.target.value)} 
                  required 
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Assign To (Collaborators)</label>
                <div style={{ border: '1px solid rgba(138, 98, 98, 0.1)', borderRadius: '12px', padding: '16px', maxHeight: '180px', overflowY: 'auto', background: 'var(--surface)' }}>
                  {project?.team_members?.map(member => (
                    <label key={member.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '8px', 
                      background: assigningMembers.includes(member.id) ? 'var(--accent-light)' : 'transparent',
                      borderRadius: '8px',
                      marginBottom: '4px', 
                      cursor: 'pointer' 
                    }}>
                      <input 
                        type="checkbox" 
                        style={{ width: '16px', height: '16px' }}
                        checked={assigningMembers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssigningMembers([...assigningMembers, member.id]);
                          } else {
                            setAssigningMembers(assigningMembers.filter(id => id !== member.id));
                          }
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{member.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{member.email}</span>
                      </div>
                    </label>
                  ))}
                  {project.team_members.length === 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No members available in this workspace.</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Scope & Requirements</label>
                <textarea 
                  className="input" 
                  placeholder="Define what needs to be done..."
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={assignDesc} 
                  onChange={(e) => setAssignDesc(e.target.value)} 
                />
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Target Deadline</label>
                <input 
                  type="date" 
                  className="input" 
                  value={assignDueDate} 
                  onChange={(e) => setAssignDueDate(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>Initialize Assignment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;

