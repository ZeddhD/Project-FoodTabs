import { useState, useEffect } from 'react';
import { restaurantAPI, bookingAPI, eventBookingAPI } from '../services/api';

const STATUS_STYLES = {
  confirmed: { bg: '#DCFCE7', color: '#16A34A' },
  pending:   { bg: '#FEF9C3', color: '#CA8A04' },
  cancelled: { bg: '#FEE2E2', color: '#DC2626' },
  completed: { bg: '#EFF6FF', color: '#2563EB' },
};

function getStatusStyle(status) {
  return STATUS_STYLES[status?.toLowerCase()] || { bg: '#F3F4F6', color: '#6B7280' };
}

export default function OwnerBookingsPage() {
  const [restaurant, setRestaurant]   = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId]   = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const restRes = await restaurantAPI.getOwnerRestaurants();
      if (!restRes.data.data?.length) { setLoading(false); return; }
      const rest = restRes.data.data[0];
      setRestaurant(rest);

      // Fetch both table and event bookings in parallel
      const [tableRes, eventRes] = await Promise.all([
        bookingAPI.getRestaurantBookings(rest._id),
        eventBookingAPI.getRestaurantBookings(rest._id, { limit: 200 }),
      ]);

      const tableBookings = (tableRes.data.data || []).map(b => ({ ...b, _type: 'table' }));
      const eventBookings = ((eventRes.data.data?.eventBookings) || (eventRes.data.data) || [])
        .map(b => ({ ...b, _type: 'event' }));

      // Merge and sort newest first
      const merged = [...tableBookings, ...eventBookings].sort((a, b) => {
        const dateA = new Date(a.bookingDate || a.eventDate);
        const dateB = new Date(b.bookingDate || b.eventDate);
        return dateB - dateA;
      });

      setAllBookings(merged);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (booking, newStatus) => {
    setUpdatingId(booking._id);
    try {
      if (booking._type === 'event') {
        await eventBookingAPI.updateStatus(booking._id, newStatus);
      } else {
        await bookingAPI.updateStatus(booking._id, newStatus);
      }
      setAllBookings(prev =>
        prev.map(b => b._id === booking._id ? { ...b, status: newStatus } : b)
      );
    } catch {
      setError('Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filterStatus === 'all'
    ? allBookings
    : allBookings.filter(b => b.status?.toLowerCase() === filterStatus);

  const counts = {
    all:       allBookings.length,
    pending:   allBookings.filter(b => b.status?.toLowerCase() === 'pending').length,
    confirmed: allBookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
    completed: allBookings.filter(b => b.status?.toLowerCase() === 'completed').length,
    cancelled: allBookings.filter(b => b.status?.toLowerCase() === 'cancelled').length,
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📅</div>
        <div className="empty-state__title">No restaurant found</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Bookings
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>
          {restaurant.name}
        </h1>
      </div>

      {error && (
        <div style={{ padding: 12, background: '#FEE', color: 'var(--clr-error)', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 14 }}>
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
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            {status === 'all' ? 'All' : status}
            {counts[status] > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: filterStatus === status ? 'var(--clr-primary)' : 'var(--clr-bg-alt)',
                color: filterStatus === status ? 'white' : 'var(--clr-text-muted)',
                borderRadius: 20, padding: '1px 7px'
              }}>
                {counts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(booking => {
            const isEvent    = booking._type === 'event';
            const statusKey  = booking.status?.toLowerCase() || 'pending';
            const sStyle     = getStatusStyle(statusKey);
            const isUpdating = updatingId === booking._id;

            const dateObj = new Date(booking.bookingDate || booking.eventDate);
            const dateStr = dateObj.toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });
            const timeStr = booking.time || booking.eventTime || '';
            const customerName  = booking.userId?.name  || '—';
            const customerEmail = booking.userId?.email || '';

            return (
              <div key={booking._id} style={{
                background: 'white', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--clr-border)', overflow: 'hidden'
              }}>

                {/* Card header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 20px',
                  background: isEvent ? '#F5F3FF' : 'var(--clr-bg-alt)',
                  borderBottom: '1px solid var(--clr-border)',
                  flexWrap: 'wrap', gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: isEvent ? '#7C3AED' : 'var(--clr-primary)'
                    }}>
                      {isEvent ? '🎉 Event Booking' : '🍽️ Table Booking'}
                    </span>
                    {booking.confirmationCode && (
                      <span style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontFamily: 'monospace' }}>
                        #{booking.confirmationCode}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 12px',
                    background: sStyle.bg, color: sStyle.color,
                    borderRadius: 20, textTransform: 'capitalize'
                  }}>
                    {booking.status || 'pending'}
                  </span>
                </div>

                {/* Customer + date row */}
                <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  {/* Who booked */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #E8460B, #FFB800)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
                    }}>
                      {customerName[0]?.toUpperCase() || '?'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{customerName}</div>
                      {customerEmail && (
                        <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{customerEmail}</div>
                      )}
                    </div>
                  </div>

                  {/* Date & time */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>📅 {dateStr}</div>
                    {timeStr && <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>🕐 {timeStr}</div>}
                  </div>
                </div>

                {/* Details row */}
                <div style={{ padding: '0 20px 14px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {isEvent ? (
                    <>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 2 }}>Event</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{booking.eventName}</div>
                        {booking.eventType && <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{booking.eventType}</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 2 }}>Guests</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{booking.guestCount}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 2 }}>Duration</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{booking.duration} min</div>
                      </div>
                      {booking.estimatedBudget > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 2 }}>Budget</div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#16A34A' }}>৳{booking.estimatedBudget}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 2 }}>Party Size</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'}</div>
                      </div>
                      {booking.tablePreference && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 2 }}>Table Preference</div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{booking.tablePreference}</div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Payment status */}
                  <div style={{ marginLeft: 'auto' }}>
                    <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 4 }}>Deposit</div>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: booking.paymentId ? '#DCFCE7' : '#FEF9C3',
                      color:      booking.paymentId ? '#16A34A' : '#92400E',
                    }}>
                      {booking.paymentId ? '✓ Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>

                {/* Special requests / notes */}
                {(booking.specialRequests || booking.specialRequirements || booking.description) && (
                  <div style={{ padding: '0 20px 14px', fontSize: 13, color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>
                    "{booking.specialRequests || booking.specialRequirements || booking.description}"
                  </div>
                )}

                {/* Actions */}
                {statusKey !== 'cancelled' && statusKey !== 'completed' && (
                  <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--clr-border)',
                    display: 'flex', gap: 8, justifyContent: 'flex-end'
                  }}>
                    {statusKey !== 'confirmed' && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(booking, 'confirmed')}
                      >
                        {isUpdating ? '...' : 'Confirm'}
                      </button>
                    )}
                    {statusKey === 'confirmed' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(booking, 'completed')}
                      >
                        {isUpdating ? '...' : 'Mark Completed'}
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(booking, 'cancelled')}
                    >
                      {isUpdating ? '...' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">📅</div>
          <div className="empty-state__title">
            {filterStatus === 'all' ? 'No bookings yet' : `No ${filterStatus} bookings`}
          </div>
          <div className="empty-state__desc">
            {filterStatus === 'all'
              ? 'Table and event bookings from customers will appear here.'
              : 'Try switching to "All" to see other bookings.'}
          </div>
        </div>
      )}
    </div>
  );
}
