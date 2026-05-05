import { useState } from 'react';
import { reportAPI } from '../services/api';

const REASONS = ['Spam', 'Offensive', 'Inappropriate', 'Misinformation', 'Other'];

export default function ReportModal({ target, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!target) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    try {
      const payload = { reason, description };
      if (target.type === 'post') payload.postId = target.id;
      else if (target.type === 'comment') payload.commentId = target.id;
      else if (target.type === 'review') payload.reviewId = target.id;
      await reportAPI.create(payload);
      setDone(true);
      setTimeout(onClose, 1500);
    } catch {
      alert('Failed to submit report. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-xl)' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--clr-dark)' }}>Report submitted</div>
            <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 6 }}>Our team will review it shortly.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>
                Report {target.type}
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--clr-text-muted)', lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Reason *</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select a reason</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Additional details{' '}
                  <span style={{ fontWeight: 400, color: 'var(--clr-text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Help us understand the issue..."
                  rows={3}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={!reason || submitting} className="btn btn-danger" style={{ flex: 1 }}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
