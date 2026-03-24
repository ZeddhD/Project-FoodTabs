import { useState } from 'react';
import { reviewAPI } from '../services/api';

export default function ReviewResponseForm({ review, onSuccess, onCancel }) {
  const [response, setResponse] = useState(review?.ownerResponse || '');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!response.trim()) { setError('Response cannot be empty'); return; }
    setError(null);
    try {
      setLoading(true);
      await reviewAPI.respond(review._id, response.trim());
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--clr-bg-alt)', padding: 16,
      borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)', marginTop: 10
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 8 }}>
        YOUR RESPONSE
      </div>
      {error && (
        <div style={{ padding: '8px 12px', background: 'var(--clr-error-light)', color: 'var(--clr-error)', borderRadius: 'var(--r-sm)', marginBottom: 10, fontSize: 13 }}>
          {error}
        </div>
      )}
      <textarea
        className="form-input"
        value={response}
        onChange={e => setResponse(e.target.value)}
        placeholder="Thank you for your review! We appreciate your feedback…"
        rows={3}
        style={{ width: '100%', resize: 'vertical', fontSize: 13 }}
        disabled={loading}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !response.trim()}>
          {loading ? 'Posting…' : review.ownerResponse ? 'Update Response' : 'Post Response'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
