import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const map = { pending: 'badge-pending', 'in-progress': 'badge-in-progress', completed: 'badge-completed' };
  return <span className={`badge ${map[status] || ''}`}>{status}</span>;
};

const statConfig = [
  { key: 'totalTasks', label: 'Total Tasks', color: '#6c63ff', bg: 'rgba(108,99,255,0.12)', icon: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  )},
  { key: 'completedTasks', label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { key: 'inProgressTasks', label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { key: 'overdueTasks', label: 'Overdue', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  )},
  { key: 'totalProjects', label: 'Projects', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  )},
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setStats(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const statValues = { ...stats, inProgressTasks: stats?.inProgressTasks };

  return (
    <div>
      <div className="page-header">
        <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening with your team today.</p>
      </div>

      <div className="stat-grid">
        {statConfig.map(({ key, label, color, bg, icon }) => (
          <div className="stat-card" key={key}>
            <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
            <div className="stat-number" style={{ color }}>{stats?.[key] ?? 0}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
        {user?.role === 'admin' && stats?.totalUsers != null && (
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div className="stat-number" style={{ color: '#a855f7' }}>{stats.totalUsers}</div>
            <div className="stat-label">Total Members</div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Tasks</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>View all →</button>
        </div>
        {!stats?.recentTasks?.length ? (
          <div className="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p>No tasks yet</p>
          </div>
        ) : (
          <div className="task-list">
            {stats.recentTasks.map(task => (
              <div className="task-item" key={task._id} onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
                <div>
                  <div className="task-item-title">{task.title}</div>
                  <div className="task-item-meta">
                    {task.project?.name} · {task.assignedTo?.name} · Due {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
