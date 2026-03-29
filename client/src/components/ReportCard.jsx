import { useState } from 'react';
import { forumAPI } from '../services/api';

export default function ReportCard({ report, onUpdate, onStatusChange }) {
  const [actionMessage, setActionMessage] = useState('');
  const [showActionForm, setShowActionForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const getContentTypeLabel = (type) => {
    const labels = {
      post: '📝 Forum Post',
      comment: '💬 Comment',
      review: '⭐ Review',
      user: '👤 User'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FF9800';
      case 'resolved':
        return '#4CAF50';
      case 'dismissed':
        return '#999';
      default:
        return '#2196F3';
    }
  };

  const handleAction = async (action) => {
    if (!actionMessage.trim() && action !== 'dismiss') {
      alert('Please enter an action message.');
      return;
    }

    try {
      setLoading(true);
      // Update report with action
      // In a real app, there would be an endpoint for admin actions
      onStatusChange?.(report._id, {
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        adminAction: action,
        adminMessage: actionMessage
      });
      alert(`Report ${action}ed successfully!`);
      setShowActionForm(false);
      setActionMessage('');
    } catch (err) {
      console.error('Error handling report:', err);
      alert('Failed to handle report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '8px',
        border: `2px solid ${getStatusColor(report.status)}`,
        padding: '16px',
        marginBottom: '12px'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '12px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{
              padding: '4px 12px',
              background: '#f0f0f0',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#666'
            }}>
              {getContentTypeLabel(report.contentType)}
            </span>
            <span style={{
              padding: '4px 12px',
              background: getStatusColor(report.status) + '20',
              color: getStatusColor(report.status),
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {report.status || 'pending'}
            </span>
          </div>
          <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
            Reported by: {report.reportedBy?.name || 'Anonymous'}
          </p>
          <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
            {new Date(report.createdAt).toLocaleDateString()} at{' '}
            {new Date(report.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <span style={{
          fontSize: '18px',
          padding: '8px 12px',
          background: '#f5f5f5',
          borderRadius: '4px'
        }}>
          #{report._id?.slice(-6)}
        </span>
      </div>

      {/* Reason */}
      <div style={{
        background: '#f9f9f9',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '12px'
      }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>
          Reason:
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>
          {report.reason}
        </p>
      </div>

      {/* Description */}
      {report.description && (
        <div style={{
          background: '#f9f9f9',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '12px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>
            Additional Details:
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>
            {report.description}
          </p>
        </div>
      )}

      {/* Admin Action Form */}
      {showActionForm && report.status !== 'resolved' && report.status !== 'dismissed' ? (
        <div style={{
          background: '#E3F2FD',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '12px',
          border: '1px solid #BBDEFB'
        }}>
          <p style={{
            margin: '0 0 8px 0',
            fontWeight: '600',
            fontSize: '12px',
            color: '#1976D2'
          }}>
            Take Action
          </p>
          <textarea
            value={actionMessage}
            onChange={(e) => setActionMessage(e.target.value)}
            placeholder="Enter action details..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px',
              border: '1px solid #BBDEFB',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'Arial',
              boxSizing: 'border-box',
              resize: 'vertical',
              marginBottom: '8px'
            }}
            disabled={loading}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleAction('resolve')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '6px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              ✓ Resolve
            </button>
            <button
              onClick={() => handleAction('dismiss')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '6px',
                background: '#999',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              ✗ Dismiss
            </button>
            <button
              onClick={() => setShowActionForm(false)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '6px',
                background: '#ddd',
                color: '#666',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : report.status !== 'resolved' && report.status !== 'dismissed' ? (
        <button
          onClick={() => setShowActionForm(true)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          ⚙️ Take Action
        </button>
      ) : (
        <div style={{
          background: '#C8E6C9',
          padding: '8px',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#2E7D32',
          fontWeight: '600'
        }}>
          ✓ Action Completed
        </div>
      )}
    </div>
  );
}