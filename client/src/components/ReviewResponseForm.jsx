import { useState } from 'react';
import { reviewAPI } from '../services/api';

export default function ReviewResponseForm({ review, onSuccess, onCancel }) {
  const [response, setResponse] = useState(review?.ownerResponse || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!response.trim()) {
      setError('Response cannot be empty');
      return;
    }

    try {
      setLoading(true);
      // In a real app, you'd have a dedicated endpoint for owner responses
      // For now, using update endpoint
      const updatedReview = {
        ...review,
        ownerResponse: response
      };
      
      await reviewAPI.update(review._id, { ownerResponse: response });
      alert('Response published successfully!');
      onSuccess?.();
    } catch (err) {
      console.error('Error posting response:', err);
      setError(err.response?.data?.message || 'Failed to post response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'white',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      marginTop: '12px'
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>
        Owner Response
      </h4>

      {error && (
        <div style={{
          padding: '10px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Thank you for your feedback! We appreciate..."
        style={{
          width: '100%',
          minHeight: '100px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '13px',
          fontFamily: 'Arial',
          boxSizing: 'border-box',
          resize: 'vertical'
        }}
        disabled={loading}
      />

      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '10px'
      }}>
        <button
          type="submit"
          disabled={loading || !response.trim()}
          style={{
            flex: 1,
            padding: '8px',
            background: loading || !response.trim() ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: loading || !response.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Posting...' : '✓ Post Response'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px',
            background: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}