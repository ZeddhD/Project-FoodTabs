import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/store.js';
import { verificationAPI } from '../services/api.js';

function VerificationCard({ req, onApprove, onReject, loading }) {
  const statusColors = { pending: '#D97706', approved: '#059669', rejected: '#DC2626' };
  const statusColor = statusColors[req.status] || '#666';

  return (
    <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '20px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, #E8460B, #FFB800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
            }}>🍽️</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--clr-dark)' }}>
                {req.restaurantId?.name || 'Restaurant'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{req.restaurantId?.address || ''}</div>
            </div>
            <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusColor + '18', color: statusColor, textTransform: 'capitalize' }}>
              {req.status}
            </span>
          </div>

          {/* Owner + dates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, fontSize: 12 }}>
            <div>
              <span style={{ color: 'var(--clr-text-muted)', fontWeight: 600 }}>Owner: </span>
              <span>{req.ownerId?.name || '—'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--clr-text-muted)', fontWeight: 600 }}>Email: </span>
              <span>{req.ownerId?.email || '—'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--clr-text-muted)', fontWeight: 600 }}>Submitted: </span>
              <span>{new Date(req.submissionDate || req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            {req.approvalDate && (
              <div>
                <span style={{ color: 'var(--clr-text-muted)', fontWeight: 600 }}>Actioned: </span>
                <span>{new Date(req.approvalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {req.adminNotes && (
            <div style={{ marginTop: 10, fontSize: 12, padding: '6px 10px', background: 'var(--clr-bg)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--clr-border)', color: 'var(--clr-text-muted)' }}>
              Admin note: {req.adminNotes}
            </div>
          )}
        </div>

        {req.status === 'pending' && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Link
              to={`/restaurant/${req.restaurantId?._id}`}
              target="_blank"
              style={{ padding: '7px 14px', background: 'var(--clr-bg)', color: 'var(--clr-text)', border: '1px solid var(--clr-border)', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
            >
              View Page
            </Link>
            <button
              onClick={() => onApprove(req._id)}
              disabled={loading}
              style={{ padding: '7px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Approve
            </button>
            <button
              onClick={() => onReject(req._id)}
              disabled={loading}
              style={{ padding: '7px 14px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerificationQueuePage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
    if (user?.role === 'admin') fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await verificationAPI.getAll({ limit: 200 });
      const raw = res.data.data;
      setRequests(Array.isArray(raw) ? raw : raw?.requests || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch verification requests');
    } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    const notes = window.prompt('Admin notes (optional):') || 'Verified and approved';
    setActionLoading(true);
    try {
      await verificationAPI.approve(id, { adminNotes: notes });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'approved', adminNotes: notes } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally { setActionLoading(false); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason?.trim()) return;
    setActionLoading(true);
    try {
      await verificationAPI.reject(id, { rejectionReason: reason });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'rejected', adminNotes: reason } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally { setActionLoading(false); }
  };

  const filtered = requests
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .sort((a, b) => sortBy === 'newest'
      ? new Date(b.submissionDate || b.createdAt) - new Date(a.submissionDate || a.createdAt)
      : new Date(a.submissionDate || a.createdAt) - new Date(b.submissionDate || b.createdAt));

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, margin: 0 }}>Verification Queue</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>Review and approve restaurant verification requests. Approved restaurants get a verified badge.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px var(--px) 60px' }}>

        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13 }}>{error}</div>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: stats.total, color: '#2563EB' },
            { label: 'Pending', value: stats.pending, color: '#D97706' },
            { label: 'Approved', value: stats.approved, color: '#059669' },
            { label: 'Rejected', value: stats.rejected, color: '#DC2626' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12 }}>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="form-input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 140 }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">✅</div>
            <div className="empty-state__title">{statusFilter === 'pending' ? 'No pending requests' : 'No requests found'}</div>
          </div>
        ) : (
          filtered.map(r => (
            <VerificationCard key={r._id} req={r} onApprove={handleApprove} onReject={handleReject} loading={actionLoading} />
          ))
        )}
      </div>
    </div>
  );
}
