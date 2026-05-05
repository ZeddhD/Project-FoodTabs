import { useState } from 'react';
import { bookingAPI } from '../services/api';

export default function BookingForm({ restaurantId, deposit = 0, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: 2,
    specialRequests: '',
    guestName: '',
    guestEmail: '',
    guestPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'partySize' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.date || !formData.time) {
      setError('Please select a date and time');
      return;
    }
    if (formData.partySize < 1 || formData.partySize > 12) {
      setError('Party size must be between 1 and 12');
      return;
    }
    if (!formData.guestName || !formData.guestEmail || !formData.guestPhone) {
      setError('Please fill in all guest information');
      return;
    }

    try {
      setLoading(true);
      const bookingDate = new Date(`${formData.date}T${formData.time}`);
      const response = await bookingAPI.create({
        restaurantId,
        bookingDate: bookingDate.toISOString(),
        time: formData.time,
        partySize: formData.partySize,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        specialRequests: formData.specialRequests
      });
      onSuccess?.(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today   = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Reservation Details</div>
      <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 20 }}>Fill in your details to hold a table</p>

      {deposit > 0 && (
        <div style={{
          padding: '10px 14px', background: 'var(--clr-primary-light)', borderRadius: 'var(--r-sm)',
          marginBottom: 16, fontSize: 13, color: 'var(--clr-primary)', fontWeight: 600,
          border: '1px solid var(--clr-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>Deposit required after booking</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900 }}>৳{deposit.toLocaleString()}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--clr-error-light)', color: 'var(--clr-error)', borderRadius: 'var(--r-sm)', marginBottom: 14, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Date + Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>DATE</label>
          <input className="form-input" type="date" name="date" value={formData.date} onChange={handleChange}
            min={today} max={maxDate} required disabled={loading} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>TIME</label>
          <input className="form-input" type="time" name="time" value={formData.time} onChange={handleChange}
            required disabled={loading} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Party Size */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>PARTY SIZE</label>
        <select className="form-input" name="partySize" value={formData.partySize} onChange={handleChange}
          disabled={loading} style={{ width: '100%' }}>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
            <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
          ))}
        </select>
      </div>

      {/* Guest info */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>FULL NAME</label>
        <input className="form-input" type="text" name="guestName" value={formData.guestName} onChange={handleChange}
          placeholder="Your full name" required disabled={loading} style={{ width: '100%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>EMAIL</label>
          <input className="form-input" type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange}
            placeholder="your@email.com" required disabled={loading} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>PHONE</label>
          <input className="form-input" type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleChange}
            placeholder="01XXXXXXXXX" required disabled={loading} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Special requests */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>SPECIAL REQUESTS <span style={{ fontWeight: 400 }}>(optional)</span></label>
        <textarea className="form-input" name="specialRequests" value={formData.specialRequests} onChange={handleChange}
          placeholder="e.g. high chair, window seating, anniversary…"
          disabled={loading} style={{ width: '100%', minHeight: 72, resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading} style={{ flex: 1 }}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
          {loading ? 'Booking…' : deposit > 0 ? `Reserve · Pay ৳${deposit.toLocaleString()} next` : 'Reserve Table'}
        </button>
      </div>
    </form>
  );
}
