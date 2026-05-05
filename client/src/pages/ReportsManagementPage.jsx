import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store.js';
import { reportAPI } from '../services/api.js';

function ReportRow({ report, onResolve, onDismiss, loading }) {
  const typeColors = { post: '#7C3AED', comment: '#2563EB', review: '#D97706', user: '#DC2626' };
  const statusColors = { pending: '#D97706', resolved: '#059669', dismissed: '#6B7280' };
  const color = typeColors[report.type] || '#666';
  const statusColor = statusColors[report.status] || '#666';

  return (
    <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '18px 20px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '18', color, textTransform: 'capitalize' }}>
              {report.type || 'Content'}
            </span>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusColor + '18', color: statusColor, textTransform: 'capitalize' }}>
              {report.status}
            </span>
            <span style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>
              {new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-dark)', marginBottom: 4 }}>
            Reason: <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{report.reason}</span>
          </div>
          {report.description && (
            <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 4 }}>"{report.description}"</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
            Reported by: <strong>{report.reporterId?.name || 'Unknown'}</strong>
            {report.reporterId?.email && <span> ({report.reporterId.email})</span>}
          </div>
          {report.adminNotes && (
            <div style={{ fontSize: 12, marginTop: 6, padding: '6px 10px', background: 'var(--clr-bg)', borderRadius: 'var(--r-sm)', color: 'var(--clr-text-muted)', borderLeft: '3px solid var(--clr-border)' }}>
              Admin note: {report.adminNotes}
            </div>
          )}
        </div>
        {report.status === 'pending' && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => onResolve(report._id)}
              disabled={loading}
              style={{ padding: '6px 14px', background: '#059669', color: 'white', border: 'none', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Resolve
            </button>
            <button
              onClick={() => onDismiss(report._id)}
              disabled={loading}
              style={{ padding: '6px 14px', background: '#6B7280', color: 'white', border: 'none', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsManagementPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
    if (user?.role === 'admin') fetchReports();
  }, [user, navigate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getAll({ limit: 200 });
      const raw = res.data.data;
      setReports(Array.isArray(raw) ? raw : raw?.reports || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally { setLoading(false); }
  };

  const handleResolve = async (reportId) => {
    const notes = window.prompt('Optional admin note for this resolution:') || 'Resolved by admin';
    setActionLoading(true);
    try {
      await reportAPI.update(reportId, { status: 'resolved', adminNotes: notes });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: 'resolved', adminNotes: notes } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve report');
    } finally { setActionLoading(false); }
  };

  const handleDismiss = async (reportId) => {
    setActionLoading(true);
    try {
      await reportAPI.update(reportId, { status: 'dismissed', adminNotes: 'Dismissed — no action required' });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: 'dismissed' } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dismiss report');
    } finally { setActionLoading(false); }
  };

  const filtered = reports
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .filter(r => typeFilter === 'all' || r.type === typeFilter)
    .sort((a, b) => sortBy === 'newest'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt));

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  if (loading) return (
    <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ background: 'var(--clr-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'white', borderBottom: '1px solid var(--clr-border)', padding: '24px var(--px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Admin</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, margin: 0 }}>Reports Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>Review and action reported content from users.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px var(--px) 60px' }}>

        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13 }}>{error}</div>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: stats.total, color: '#2563EB' },
            { label: 'Pending', value: stats.pending, color: '#D97706' },
            { label: 'Resolved', value: stats.resolved, color: '#059669' },
            { label: 'Dismissed', value: stats.dismissed, color: '#6B7280' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 140 }}>
            <option value="all">All Types</option>
            <option value="post">Forum Post</option>
            <option value="comment">Comment</option>
            <option value="review">Review</option>
          </select>
          <select className="form-input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 140 }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">✅</div>
            <div className="empty-state__title">{statusFilter === 'pending' ? 'No pending reports' : 'No reports found'}</div>
          </div>
        ) : (
          filtered.map(r => (
            <ReportRow key={r._id} report={r} onResolve={handleResolve} onDismiss={handleDismiss} loading={actionLoading} />
          ))
        )}
      </div>
    </div>
  );
}
