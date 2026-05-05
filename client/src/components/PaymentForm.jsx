import { useState } from 'react';
import { paymentAPI } from '../services/api';

export default function PaymentForm({ bookingId, eventBookingId, amount, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [done,    setDone]    = useState(false);
  const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' });

  const fmt = (name, raw) => {
    if (name === 'number') {
      const d = raw.replace(/\D/g, '').slice(0, 16);
      return d.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    if (name === 'expiry') {
      const d = raw.replace(/\D/g, '').slice(0, 4);
      return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
    }
    if (name === 'cvv') return raw.replace(/\D/g, '').slice(0, 4);
    return raw;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCard(p => ({ ...p, [name]: fmt(name, value) }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const digits = card.number.replace(/\s/g, '');
    if (!digits.match(/^\d{16}$/))         { setError('Card number must be 16 digits'); return; }
    if (!card.holder.trim())               { setError('Cardholder name is required');   return; }
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) { setError('Expiry must be MM/YY');      return; }
    if (!card.cvv.match(/^\d{3,4}$/))      { setError('CVV must be 3–4 digits');        return; }

    try {
      setLoading(true);
      const res = await paymentAPI.demoPay({
        bookingId,
        eventBookingId,
        amount,
        cardLastFour: digits.slice(-4),
      });
      setDone(true);
      setTimeout(() => onSuccess?.(res.data.data), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Payment Details</div>
      <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 20 }}>Demo card — no real charges</p>

      {/* Amount pill */}
      <div style={{ padding: '14px 20px', background: 'var(--clr-primary-light)', borderRadius: 'var(--r-md)', marginBottom: 20, textAlign: 'center', border: '2px solid var(--clr-primary)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Deposit Amount</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--clr-primary)' }}>৳{amount?.toLocaleString() || '0'}</div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--clr-error-light)', color: 'var(--clr-error)', borderRadius: 'var(--r-sm)', marginBottom: 14, fontSize: 13 }}>
          {error}
        </div>
      )}
      {done && (
        <div style={{ padding: '10px 14px', background: 'var(--clr-success-light)', color: 'var(--clr-success)', borderRadius: 'var(--r-sm)', marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
          ✓ Payment successful! Booking confirmed.
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>CARDHOLDER NAME</label>
        <input className="form-input" name="holder" value={card.holder} onChange={handleChange} placeholder="Your Name" disabled={loading || done} style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>CARD NUMBER</label>
        <input className="form-input" name="number" value={card.number} onChange={handleChange} placeholder="4242 4242 4242 4242" maxLength={19} disabled={loading || done} style={{ width: '100%', fontFamily: 'monospace', letterSpacing: 2 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>EXPIRY</label>
          <input className="form-input" name="expiry" value={card.expiry} onChange={handleChange} placeholder="MM/YY" maxLength={5} disabled={loading || done} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>CVV</label>
          <input className="form-input" name="cvv" value={card.cvv} onChange={handleChange} placeholder="123" maxLength={4} disabled={loading || done} />
        </div>
      </div>

      <div style={{ padding: '10px 14px', background: 'var(--clr-accent-light)', borderRadius: 'var(--r-sm)', marginBottom: 16, fontSize: 12, color: '#92400E' }}>
        <strong>Test card:</strong> 4242 4242 4242 4242 · Any future MM/YY · Any CVV
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading || done} style={{ flex: 1 }}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || done} style={{ flex: 2 }}>
          {done ? '✓ Paid' : loading ? 'Processing…' : `Pay ৳${amount?.toLocaleString() || '0'}`}
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--clr-text-light)', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
        🔒 Demo environment — no real charges made
      </p>
    </form>
  );
}
