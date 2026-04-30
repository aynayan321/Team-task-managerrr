import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      onCreated(data);
      toast.success('Project created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>New Project</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-control" placeholder="e.g. Website Redesign" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" placeholder="What's this project about?" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="modal-footer" style={{ margin: 0, padding: 0, border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects').then(({ data }) => setProjects(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Projects</h1>
            <p>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New Project
            </button>
          )}
        </div>
      </div>

      {!projects.length ? (
        <div className="card">
          <div className="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p>No projects yet{isAdmin ? '. Create your first one!' : '.'}</p>
          </div>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div className="project-card" key={p._id} onClick={() => navigate(`/projects/${p._id}`)}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <h3>{p.name}</h3>
                  <span className={`badge ${p.status === 'active' ? 'badge-in-progress' : p.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>{p.status}</span>
                </div>
                <p>{p.description || 'No description provided.'}</p>
              </div>
              <div className="project-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex' }}>
                    {p.members?.slice(0, 4).map((m, i) => (
                      <div key={m._id} title={m.name} style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: `hsl(${m._id.charCodeAt(0) * 12}deg 50% 40%)`,
                        color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginLeft: i > 0 ? -8 : 0, border: '2px solid var(--bg-card)',
                        fontFamily: 'var(--font-head)',
                      }}>
                        {m.name[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.members?.length} member{p.members?.length !== 1 ? 's' : ''}</span>
                </div>
                {isAdmin && (
                  <button className="btn btn-danger btn-sm" onClick={e => handleDelete(p._id, e)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={p => setProjects(prev => [p, ...prev])} />}
    </div>
  );
}
