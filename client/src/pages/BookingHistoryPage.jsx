import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { bookingAPI } from '../services/api';

export default function BookingHistoryPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAll();
      setBookings(response.data.data?.bookings || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancel(bookingId);
        setBookings(bookings.filter(b => b._id !== bookingId));
        alert('Booking cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status?.toLowerCase() === filterStatus.toLowerCase());

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        ⏳ Loading bookings...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>My Bookings</h1>
          <p style={{ margin: 0, color: '#666' }}>
            View and manage your restaurant reservations
          </p>
        </div>
        <Link
          to="/"
          style={{
            padding: '8px 16px',
            background: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Browse Restaurants
        </Link>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: filterStatus === status ? '600' : '400',
              color: filterStatus === status ? '#2196F3' : '#999',
              borderBottom: filterStatus === status ? '3px solid #2196F3' : 'none',
              cursor: 'pointer',
              marginBottom: '-2px',
              textTransform: 'capitalize'
            }}
          >
            {status === 'all' ? 'All Bookings' : status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings && filteredBookings.length > 0 ? (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                overflow: 'hidden'
              }}
            >
              {/* Booking Card Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                padding: '16px',
                background: '#f9f9f9',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                    {booking.restaurantId?.name || 'Restaurant'}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>
                    📍 {booking.restaurantId?.address}
                  </p>
                </div>
                <span style={{
                  padding: '6px 12px',
                  background: getStatusColor(booking.status) + '20',
                  color: getStatusColor(booking.status),
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {booking.status || 'pending'}
                </span>
              </div>

              {/* Booking Details */}
              <div style={{
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
                    Date & Time
                  </p>
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>
                    {new Date(booking.bookingDate).toLocaleDateString()} at{' '}
                    {new Date(booking.bookingDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
                    Party Size
                  </p>
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>
                    {booking.partySize} {booking.partySize === 1 ? 'Guest' : 'Guests'}
                  </p>
                </div>

                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
                    Guest Name
                  </p>
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>
                    {booking.guestName}
                  </p>
                </div>

                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
                    Confirmation
                  </p>
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '14px', color: '#2196F3' }}>
                    #{booking._id?.slice(-6)}
                  </p>
                </div>

                {(booking.restaurantId?.bookingDeposit > 0) && (
                  <div>
                    <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '12px' }}>Payment</p>
                    {booking.paymentId ? (
                      <span style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: '#DCFCE7', color: '#16A34A',
                      }}>
                        ✓ Deposit Paid
                      </span>
                    ) : (
                      <Link
                        to={`/payment/${booking._id}`}
                        style={{
                          display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                          fontSize: 12, fontWeight: 700, textDecoration: 'none',
                          background: '#FEF9C3', color: '#92400E',
                          border: '1px solid #FDE68A',
                        }}
                      >
                        Pay ৳{booking.restaurantId.bookingDeposit.toLocaleString()} →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div style={{
                  padding: '0 16px',
                  marginBottom: '12px'
                }}>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
                    Special Requests
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>
                    {booking.specialRequests}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{
                padding: '12px 16px',
                background: '#f9f9f9',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end'
              }}>
                {booking.status !== 'cancelled' && (
                  <>
                    {/* Pay Now — only if deposit required and not yet paid */}
                    {(booking.restaurantId?.bookingDeposit > 0) && !booking.paymentId && (
                      <Link
                        to={`/payment/${booking._id}`}
                        style={{
                          padding: '6px 14px', background: '#16A34A', color: 'white',
                          textDecoration: 'none', borderRadius: '4px', fontSize: '12px',
                          fontWeight: '700', cursor: 'pointer'
                        }}
                      >
                        Pay ৳{booking.restaurantId.bookingDeposit.toLocaleString()}
                      </Link>
                    )}
                    <Link
                      to={`/restaurant/${booking.restaurantId?._id}`}
                      style={{
                        padding: '6px 12px', background: '#2196F3', color: 'white',
                        textDecoration: 'none', borderRadius: '4px', fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      View Restaurant
                    </Link>
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      style={{
                        padding: '6px 12px', background: '#f44336', color: 'white',
                        border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '32px',
          background: '#f5f5f5',
          borderRadius: '8px',
          color: '#999'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '12px' }}>
            {filterStatus === 'all'
              ? 'No bookings yet.'
              : `No ${filterStatus} bookings.`}
          </p>
          <Link
            to="/"
            style={{
              color: '#2196F3',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Start exploring restaurants
          </Link>
        </div>
      )}
    </div>
  );
}