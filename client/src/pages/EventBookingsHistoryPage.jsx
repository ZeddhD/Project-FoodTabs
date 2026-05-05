import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/store';
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

export default function EventBookingsHistoryPage() {
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await eventBookingAPI.getAll();
      setBookings(res.data.data?.eventBookings || res.data.data || []);
      setError(null);
    } catch {
      setError('Failed to load event bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const filtered = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status?.toLowerCase() === filterStatus);

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 60px' }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          My Account
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>
          My Event Bookings
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>
          Track your private event and function requests.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--clr-border)' }}>
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '10px 14px', background: 'none', border: 'none',
              fontSize: 13, fontWeight: filterStatus === status ? 700 : 500,
              color: filterStatus === status ? 'var(--clr-primary)' : 'var(--clr-text-muted)',
              borderBottom: filterStatus === status ? '2px solid var(--clr-primary)' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -2, textTransform: 'capitalize',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {status === 'all' ? 'All' : status}
            {counts[status] > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: filterStatus === status ? 'var(--clr-primary)' : 'var(--clr-bg-alt)',
                color: filterStatus === status ? 'white' : 'var(--clr-text-muted)',
                borderRadius: 20, padding: '1px 7px',
              }}>
                {counts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🎉</div>
          <div className="empty-state__title">
            {filterStatus === 'all' ? 'No event bookings yet' : `No ${filterStatus} event bookings`}
          </div>
          <div className="empty-state__desc">
            {filterStatus === 'all'
              ? 'Book a private event or function at any restaurant.'
              : 'Switch to "All" to see your full event history.'}
          </div>
          {filterStatus === 'all' && (
            <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Restaurants</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(booking => {
            const statusKey   = booking.status?.toLowerCase() || 'pending';
            const sStyle      = getStatusStyle(statusKey);
            const eventDate   = booking.eventDate
              ? new Date(booking.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              : '—';
            const isCompleted = statusKey === 'completed';

            return (
              <div key={booking._id} style={{
                background: 'white', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--clr-border)',
                boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 20px', background: 'var(--clr-bg-alt)',
                  borderBottom: '1px solid var(--clr-border)', flexWrap: 'wrap', gap: 8,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--clr-dark)' }}>
                      {booking.eventName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>
                      {booking.restaurantId?.name || 'Restaurant'}
                      {booking.eventType ? ` · ${booking.eventType}` : ''}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 12px',
                    background: sStyle.bg, color: sStyle.color,
                    borderRadius: 20, textTransform: 'capitalize',
                  }}>
                    {booking.status || 'pending'}
                  </span>
                </div>

                {/* Details */}
                <div style={{ padding: '16px 20px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 3 }}>Date & Time</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {eventDate}{booking.eventTime ? ` · ${booking.eventTime}` : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 3 }}>Guests</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                  {booking.duration && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 3 }}>Duration</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {booking.duration >= 60
                          ? `${Math.floor(booking.duration / 60)}h${booking.duration % 60 ? ` ${booking.duration % 60}m` : ''}`
                          : `${booking.duration}m`}
                      </div>
                    </div>
                  )}
                  {booking.estimatedBudget > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 3 }}>Budget</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>৳{booking.estimatedBudget.toLocaleString()}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 3 }}>Ref</div>
                    <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'monospace', color: 'var(--clr-primary)' }}>
                      #{booking.confirmationCode?.slice(-8) || booking._id?.slice(-6)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--clr-border)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {isCompleted && booking.restaurantId?._id && (
                    <Link to={`/review/create?restaurantId=${booking.restaurantId._id}`} className="btn btn-primary btn-sm">
                      Write a Review
                    </Link>
                  )}
                  <Link to={`/event-bookings/${booking._id}`} className="btn btn-ghost btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
