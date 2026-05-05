import { useState } from 'react';

export default function VerificationRequestCard({ request, onApprove, onReject, loading }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FF9800';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      default:
        return '#2196F3';
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    onReject?.(request._id, rejectReason);
    setShowRejectForm(false);
    setRejectReason('');
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '8px',
        border: `2px solid ${getStatusColor(request.status)}`,
        overflow: 'hidden',
        marginBottom: '12px'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        padding: '16px',
        background: '#f9f9f9',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
            🍽️ {request.restaurant?.name || 'Restaurant'}
          </h3>
          <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '13px' }}>
            Owner: {request.owner?.name}
          </p>
          <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
            Requested: {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span style={{
          padding: '6px 12px',
          background: getStatusColor(request.status) + '20',
          color: getStatusColor(request.status),
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase'
        }}>
          {request.status || 'pending'}
        </span>
      </div>

      {/* Restaurant Details */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
              Location
            </p>
            <p style={{ margin: 0, fontWeight: '500', fontSize: '13px' }}>
              {request.restaurant?.location}
            </p>
          </div>

          <div>
            <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
              Cuisine Type
            </p>
            <p style={{ margin: 0, fontWeight: '500', fontSize: '13px' }}>
              {request.restaurant?.cuisineType}
            </p>
          </div>

          <div>
            <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
              Phone
            </p>
            <p style={{ margin: 0, fontWeight: '500', fontSize: '13px' }}>
              {request.restaurant?.phone}
            </p>
          </div>

          <div>
            <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
              Website
            </p>
            <p style={{ margin: 0, fontWeight: '500', fontSize: '13px' }}>
              {request.restaurant?.website || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Documents */}
      {request.documents && request.documents.length > 0 && (
        <div style={{
          padding: '16px',
          background: '#f9f9f9',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '12px', color: '#666' }}>
            📄 Submitted Documents:
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px' }}>
            {request.documents.map((doc, idx) => (
              <li key={idx} style={{ margin: '4px 0' }}>
                {doc.name || `Document ${idx + 1}`}
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginLeft: '8px',
                      color: '#2196F3',
                      textDecoration: 'none',
                      fontSize: '12px'
                    }}
                  >
                    [View]
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: '16px',
        display: 'flex',
        gap: '8px'
      }}>
        {request.status === 'pending' ? (
          <>
            <button
              onClick={() => onApprove?.(request._id)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                opacity: loading ? 0.6 : 1
              }}
            >
              ✓ Approve
            </button>
            {!showRejectForm ? (
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  opacity: loading ? 0.6 : 1
                }}
              >
                ✗ Reject
              </button>
            ) : (
              <div style={{ flex: 1 }}>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    boxSizing: 'border-box',
                    marginBottom: '6px',
                    resize: 'vertical'
                  }}
                  disabled={loading}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '4px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '4px',
                      background: '#ddd',
                      color: '#666',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{
            width: '100%',
            padding: '8px',
            background: request.status === 'approved' ? '#C8E6C9' : '#FFCCCC',
            color: request.status === 'approved' ? '#2E7D32' : '#C62828',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '12px'
          }}>
            {request.status === 'approved'
              ? '✓ Verified & Approved'
              : '✗ Rejected'}
          </div>
        )}
      </div>
    </div>
  );
}