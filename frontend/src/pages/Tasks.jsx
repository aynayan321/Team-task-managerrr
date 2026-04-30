import { useState, useEffect, useCallback } from 'react';
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

function TaskModal({ task, projects, users, onClose, onSave }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState(task ? {
    title: task.title, description: task.description || '',
    projectId: task.project?._id || '', assignedTo: task.assignedTo?._id || '',
    dueDate: task.dueDate?.slice(0, 10) || '', priority: task.priority, status: task.status
  } : { title: '', description: '', projectId: '', assignedTo: '', dueDate: '', priority: 'medium', status: 'pending' });
  const [loading, setLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => {
    if (form.projectId) {
      api.get(`/projects/${form.projectId}`).then(({ data }) => setProjectMembers(data.members || [])).catch(() => {});
    }
  }, [form.projectId]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      let data;
      if (task) {
        ({ data } = await api.put(`/tasks/${task._id}`, form));
        toast.success('Task updated!');
      } else {
        ({ data } = await api.post('/tasks', form));
        toast.success('Task created!');
      }
      onSave(data, !!task);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Create Task'}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isAdmin ? (
            <>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Task title" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Details..." />
              </div>
              <div className="two-col" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Project *</label>
                  <select className="form-control" value={form.projectId} onChange={e => { setForm({ ...form, projectId: e.target.value, assignedTo: '' }); }} required>
                    <option value="">Select project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To *</label>
                  <select className="form-control" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} required disabled={!form.projectId}>
                    <option value="">Select member</option>
                    {(projectMembers.length ? projectMembers : users).map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="two-col" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input className="form-control" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              {task && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{task?.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task?.description}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Update Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </>
          )}
          <div className="modal-footer" style={{ margin: 0, padding: 0, border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (task ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const FILTERS = ['all', 'pending', 'in-progress', 'completed'];

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalTask, setModalTask] = useState(undefined); // undefined=closed, null=create, obj=edit
  const [projectFilter, setProjectFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (projectFilter) params.set('projectId', projectFilter);
    const { data } = await api.get(`/tasks?${params}`);
    setTasks(data);
  }, [filter, projectFilter]);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchTasks();
        const [{ data: projs }] = await Promise.all([api.get('/projects')]);
        setProjects(projs);
        if (isAdmin) {
          const { data: u } = await api.get('/users');
          setUsers(u);
        }
      } catch { toast.error('Failed to load tasks'); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) fetchTasks();
  }, [filter, projectFilter]);

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setTasks(prev => prev.map(t => t._id === saved._id ? saved : t));
    } else {
      setTasks(prev => [saved, ...prev]);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status });
      setTasks(prev => prev.map(t => t._id === data._id ? data : t));
      toast.success('Status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Tasks</h1>
            <p>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setModalTask(null)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          {FILTERS.map(f => (
            <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {projects.length > 0 && (
          <select className="form-control" style={{ width: 'auto', minWidth: 160 }} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {!tasks.length ? (
          <div className="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <p>No tasks found{filter !== 'all' ? ` with status "${filter}"` : ''}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => {
                  const overdue = new Date(t.dueDate) < new Date() && t.status !== 'completed';
                  return (
                    <tr key={t._id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 200 }}>{t.title}</div>
                        {t.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{t.description}</div>}
                      </td>
                      <td>{t.project?.name || '—'}</td>
                      <td>{t.assignedTo?.name || '—'}</td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', minWidth: 120 }}
                          value={t.status}
                          onChange={e => handleStatusChange(t, e.target.value)}
                          disabled={!isAdmin && t.assignedTo?._id !== t.assignedTo?._id}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td>
                        <span style={{ color: overdue ? 'var(--danger)' : '', fontSize: '0.85rem' }}>
                          {overdue && '⚠ '}
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModalTask(t)} title="Edit">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          {isAdmin && (
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(t._id)} title="Delete" style={{ color: 'var(--danger)' }}>
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          projects={projects}
          users={users}
          onClose={() => setModalTask(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
