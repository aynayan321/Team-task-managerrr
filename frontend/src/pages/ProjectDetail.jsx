import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const map = { pending: 'badge-pending', 'in-progress': 'badge-in-progress', completed: 'badge-completed' };
  return <span className={`badge ${map[status] || ''}`}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
  return <span className={`badge ${map[priority] || ''}`}>{priority}</span>;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addMemberId, setAddMemberId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: proj }, { data: t }] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?projectId=${id}`),
        ]);
        setProject(proj);
        setTasks(t);
        if (isAdmin) {
          const { data: users } = await api.get('/users');
          setAllUsers(users);
        }
      } catch (err) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddMember = async () => {
    if (!addMemberId) return;
    try {
      const { data } = await api.post(`/projects/${id}/members`, { userId: addMemberId });
      setProject(data);
      setAddMemberId('');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      const { data } = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!project) return null;

  const nonMembers = allUsers.filter(u => !project.members.find(m => m._id === u._id));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ padding: '4px 8px' }}>← Back</button>
              <span className={`badge ${project.status === 'active' ? 'badge-in-progress' : 'badge-completed'}`}>{project.status}</span>
            </div>
            <h1>{project.name}</h1>
            {project.description && <p>{project.description}</p>}
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Members */}
        <div className="card">
          <h2 className="section-title">Team Members ({project.members?.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: isAdmin ? 16 : 0 }}>
            {project.members?.map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{m.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge badge-${m.role}`}>{m.role}</span>
                  {isAdmin && project.owner?._id !== m._id && (
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleRemoveMember(m._id)} style={{ color: 'var(--danger)' }}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {isAdmin && nonMembers.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-control" value={addMemberId} onChange={e => setAddMemberId(e.target.value)}>
                <option value="">Add a member...</option>
                {nonMembers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleAddMember} disabled={!addMemberId}>Add</button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="card">
          <h2 className="section-title">Task Overview</h2>
          {(() => {
            const total = tasks.length;
            const done = tasks.filter(t => t.status === 'completed').length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Total Tasks', val: total, color: 'var(--accent)' },
                  { label: 'Completed', val: done, color: 'var(--success)' },
                  { label: 'In Progress', val: tasks.filter(t => t.status === 'in-progress').length, color: 'var(--info)' },
                  { label: 'Pending', val: tasks.filter(t => t.status === 'pending').length, color: 'var(--warning)' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--success)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Tasks */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Tasks ({tasks.length})</h2>
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => navigate(`/tasks?project=${id}`)}>+ Add Task</button>}
        </div>
        {!tasks.length ? (
          <div className="empty-state"><p>No tasks for this project yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th></tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.title}</td>
                    <td>{t.assignedTo?.name}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td style={{ color: new Date(t.dueDate) < new Date() && t.status !== 'completed' ? 'var(--danger)' : '' }}>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
