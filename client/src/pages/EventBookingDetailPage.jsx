import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventBookingAPI } from '../services/api';

const STATUS_STYLES = {
  pending:   { bg: '#FEF9C3', color: '#CA8A04' },
  confirmed: { bg: '#DCFCE7', color: '#16A34A' },
  cancelled: { bg: '#FEE2E2', color: '#DC2626' },
  completed: { bg: '#EFF6FF', color: '#2563EB' },
};

function getStatusStyle(status) {
  return STATUS_STYLES[status?.toLowerCase()] || { bg: '#F3F4F6', color: '#6B7280' };
}

const Row = ({ label, value }) => value ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>{value}</div>
  </div>
) : null;

export default function EventBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { fetchBooking(); }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await eventBookingAPI.getById(id);
      setBooking(res.data.data);
      setError(null);
    } catch {
      setError('Failed to load event booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this event booking?')) return;
    setCancelling(true);
    try {
      await eventBookingAPI.cancel(id);
      setBooking(prev => ({ ...prev, status: 'cancelled' }));
    } catch {
      setError('Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ padding: '14px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
        <Link to="/event-bookings" style={{ color: 'var(--clr-primary)', fontWeight: 600, fontSize: 14 }}>← My Event Bookings</Link>
      </div>
    );
  }

  if (!booking) return null;

  const sStyle      = getStatusStyle(booking.status);
  const statusKey   = booking.status?.toLowerCase();
  const canCancel   = statusKey === 'pending' || statusKey === 'confirmed';
  const eventDate   = booking.eventDate
    ? new Date(booking.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '—';
  const durationHrs = booking.duration
    ? booking.duration >= 60
      ? `${Math.floor(booking.duration / 60)}h${booking.duration % 60 ? ` ${booking.duration % 60}m` : ''}`
      : `${booking.duration}m`
    : '—';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 60px' }}>

      <Link to="/event-bookings" style={{ color: 'var(--clr-primary)', fontSize: 13, fontWeight: 600, display: 'inline-block', marginBottom: 20 }}>
        ← My Event Bookings
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Event Booking
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, margin: 0 }}>
            {booking.eventName}
          </h1>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', background: sStyle.bg, color: sStyle.color, borderRadius: 20, textTransform: 'capitalize' }}>
            {booking.status || 'pending'}
          </span>
        </div>
        {booking.restaurantId?.name && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>
            📍 {booking.restaurantId.name}{booking.restaurantId.city ? `, ${booking.restaurantId.city}` : ''}
          </p>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Confirmation code */}
      <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '16px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Confirmation Code</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--clr-primary)' }}>
          {booking.confirmationCode?.slice(-10) || booking._id?.slice(-8).toUpperCase()}
        </span>
      </div>

      {/* Main details */}
      <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '24px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, margin: '0 0 20px' }}>Event Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
          <Row label="Event Type"   value={booking.eventType} />
          <Row label="Date"         value={eventDate} />
          <Row label="Time"         value={booking.eventTime} />
          <Row label="Duration"     value={durationHrs} />
          <Row label="Guests"       value={`${booking.guestCount} ${booking.guestCount === 1 ? 'guest' : 'guests'}`} />
          {booking.estimatedBudget > 0 && (
            <Row label="Budget" value={`৳${booking.estimatedBudget.toLocaleString()}`} />
          )}
        </div>

        {booking.description && (
          <>
            <div style={{ borderTop: '1px solid var(--clr-border)', margin: '20px 0' }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Description</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: 'var(--clr-text)' }}>{booking.description}</p>
            </div>
          </>
        )}

        {booking.specialRequirements && (
          <>
            <div style={{ borderTop: '1px solid var(--clr-border)', margin: '20px 0' }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Special Requirements</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: 'var(--clr-text)', fontStyle: 'italic' }}>"{booking.specialRequirements}"</p>
            </div>
          </>
        )}
      </div>

      {/* Status info */}
      {statusKey === 'pending' && (
        <div style={{ padding: '12px 16px', background: '#FEF9C3', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 13, color: '#92400E' }}>
          ⏳ Your request is being reviewed by the restaurant. You'll receive a notification once confirmed.
        </div>
      )}
      {statusKey === 'confirmed' && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 13, color: '#166534', fontWeight: 600 }}>
          ✓ Your event is confirmed! Contact the restaurant for any final arrangements.
        </div>
      )}
      {statusKey === 'completed' && (
        <div style={{ padding: '12px 16px', background: '#EFF6FF', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 13, color: '#1D4ED8', fontWeight: 600 }}>
          ✓ Event completed. We hope it was a great experience!
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {booking.restaurantId?._id && (
          <Link to={`/restaurant/${booking.restaurantId._id}`} className="btn btn-ghost">
            View Restaurant
          </Link>
        )}
        {statusKey === 'completed' && booking.restaurantId?._id && (
          <Link to={`/review/create?restaurantId=${booking.restaurantId._id}`} className="btn btn-primary">
            Write a Review
          </Link>
        )}
        {canCancel && (
          <button onClick={handleCancel} disabled={cancelling} className="btn btn-danger">
            {cancelling ? 'Cancelling…' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
}
