import { useState } from 'react';

const STATUS_STYLES = {
  pending:   { color: '#D97706', bg: '#FEF3C720' },
  resolved:  { color: '#059669', bg: '#D1FAE520' },
  dismissed: { color: 'var(--clr-text-muted)', bg: 'var(--clr-bg-alt)' },
};

export default function ReportCard({ report, onUpdate, onStatusChange }) {
  const [actionMessage, setActionMessage] = useState('');
  const [showActionForm, setShowActionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const getContentTypeLabel = (type) => {
    const labels = {
      post:    '📝 Forum Post',
      comment: '💬 Comment',
      review:  '⭐ Review',
      user:    '👤 User',
    };
    return labels[type] || type;
  };

  const statusStyle = STATUS_STYLES[report.status?.toLowerCase()] || { color: 'var(--clr-primary)', bg: 'var(--clr-primary-light)' };

  const handleAction = async (action) => {
    if (!actionMessage.trim() && action !== 'dismiss') {
      setActionError('Please enter an action message.');
      return;
    }
    try {
      setLoading(true);
      setActionError(null);
      onStatusChange?.(report._id, {
        status:        action === 'dismiss' ? 'dismissed' : 'resolved',
        adminAction:   action,
        adminMessage:  actionMessage,
      });
      setActionSuccess(`Report ${action}d successfully.`);
      setShowActionForm(false);
      setActionMessage('');
    } catch {
      setActionError('Failed to handle report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isActioned = report.status === 'resolved' || report.status === 'dismissed';

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--r-lg)',
      border: `2px solid ${statusStyle.color}`,
      padding: '16px',
      marginBottom: 12,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span className="tag" style={{ background: 'var(--clr-bg-alt)', color: 'var(--clr-text-muted)' }}>
              {getContentTypeLabel(report.contentType)}
            </span>
            <span className="tag" style={{ background: statusStyle.bg, color: statusStyle.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {report.status || 'pending'}
            </span>
          </div>
          <p style={{ margin: '0 0 2px', color: 'var(--clr-text-muted)', fontSize: 12 }}>
            Reported by: {report.reportedBy?.name || 'Anonymous'}
          </p>
          <p style={{ margin: 0, color: 'var(--clr-text-muted)', fontSize: 12 }}>
            {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 10px', background: 'var(--clr-bg-alt)', borderRadius: 'var(--r-sm)', color: 'var(--clr-text-muted)' }}>
          #{report._id?.slice(-6)}
        </span>
      </div>

      {/* Reason */}
      <div style={{ background: 'var(--clr-bg)', padding: '10px 12px', borderRadius: 'var(--r-md)', marginBottom: 10 }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)' }}>Reason:</p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--clr-text)' }}>{report.reason}</p>
      </div>

      {/* Description */}
      {report.description && (
        <div style={{ background: 'var(--clr-bg)', padding: '10px 12px', borderRadius: 'var(--r-md)', marginBottom: 10 }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)' }}>Additional Details:</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--clr-text)' }}>{report.description}</p>
        </div>
      )}

      {/* Feedback */}
      {actionError && (
        <div style={{ padding: '8px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-sm)', marginBottom: 10, fontSize: 13 }}>
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div style={{ padding: '8px 12px', background: '#D1FAE5', color: '#059669', borderRadius: 'var(--r-sm)', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
          ✓ {actionSuccess}
        </div>
      )}

      {/* Action Form */}
      {showActionForm && !isActioned ? (
        <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: 'var(--r-md)', marginBottom: 12, border: '1px solid #BFDBFE' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 12, color: '#2563EB' }}>Take Action</p>
          <textarea
            value={actionMessage}
            onChange={e => { setActionMessage(e.target.value); setActionError(null); }}
            placeholder="Enter action details..."
            className="form-input"
            style={{ minHeight: 80, fontSize: 12, resize: 'vertical', marginBottom: 8 }}
            disabled={loading}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleAction('resolve')} disabled={loading} className="btn btn-sm" style={{ flex: 1, background: '#059669', color: 'white', border: 'none' }}>
              ✓ Resolve
            </button>
            <button onClick={() => handleAction('dismiss')} disabled={loading} className="btn btn-sm" style={{ flex: 1, background: 'var(--clr-text-muted)', color: 'white', border: 'none' }}>
              ✗ Dismiss
            </button>
            <button onClick={() => setShowActionForm(false)} disabled={loading} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </div>
      ) : !isActioned ? (
        <button onClick={() => setShowActionForm(true)} className="btn btn-primary" style={{ width: '100%', fontSize: 13 }}>
          ⚙️ Take Action
        </button>
      ) : (
        <div style={{ background: '#D1FAE5', padding: '8px', borderRadius: 'var(--r-sm)', textAlign: 'center', fontSize: 12, color: '#059669', fontWeight: 600 }}>
          ✓ Action Completed
        </div>
      )}
    </div>
  );
}
