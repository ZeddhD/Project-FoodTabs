import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import PaymentForm from '../components/PaymentForm';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => { fetchBooking(); }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getById(bookingId);
      setBooking(res.data.data);
    } catch {
      setError('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>
  );

  if (error || !booking) return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px' }}>
      <div style={{ padding: 16, background: 'var(--clr-error-light)', color: 'var(--clr-error)', borderRadius: 'var(--r-md)', marginBottom: 16 }}>
        {error || 'Booking not found.'}
      </div>
      <Link to="/bookings" className="btn btn-ghost">Back to Bookings</Link>
    </div>
  );

  const deposit     = booking.restaurantId?.bookingDeposit || 0;
  const alreadyPaid = !!booking.paymentId;
  const restName    = booking.restaurantId?.name || 'Restaurant';
  const dateStr     = new Date(booking.bookingDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '32px var(--px) 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← Back</button>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Confirm Reservation</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, margin: 0 }}>Complete Payment</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>Pay the deposit to secure your table at {restName}</p>
        </div>

        {/* Booking summary */}
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '20px 24px', margin: '24px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Booking Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--clr-text-light)', marginBottom: 2 }}>Restaurant</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{restName}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--clr-text-light)', marginBottom: 2 }}>Date</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{dateStr}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--clr-text-light)', marginBottom: 2 }}>Time</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{booking.time}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--clr-text-light)', marginBottom: 2 }}>Party Size</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{booking.partySize} {booking.partySize === 1 ? 'Guest' : 'Guests'}</div>
            </div>
            {booking.specialRequests && (
              <div style={{ gridColumn: '1/-1' }}>
                <div style={{ fontSize: 11, color: 'var(--clr-text-light)', marginBottom: 2 }}>Special Requests</div>
                <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>{booking.specialRequests}</div>
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--clr-border)', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Deposit Required</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--clr-primary)' }}>৳{deposit.toLocaleString()}</span>
          </div>
        </div>

        {/* Already paid */}
        {alreadyPaid ? (
          <div style={{ padding: '20px 24px', background: 'var(--clr-success-light)', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-success)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--clr-success)', marginBottom: 4 }}>Deposit Already Paid</div>
            <p style={{ fontSize: 13, color: 'var(--clr-success)', margin: '0 0 16px' }}>Your booking is confirmed.</p>
            <Link to="/bookings" className="btn btn-primary">View My Bookings</Link>
          </div>
        ) : deposit === 0 ? (
          /* No deposit required */
          <div style={{ padding: '20px 24px', background: 'var(--clr-success-light)', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-success)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--clr-success)', marginBottom: 4 }}>No Deposit Required</div>
            <p style={{ fontSize: 13, color: 'var(--clr-success)', margin: '0 0 16px' }}>{restName} doesn't require an advance deposit. Your booking is pending confirmation.</p>
            <Link to="/bookings" className="btn btn-primary">View My Bookings</Link>
          </div>
        ) : (
          <PaymentForm
            bookingId={bookingId}
            amount={deposit}
            onSuccess={() => navigate('/bookings')}
            onCancel={() => navigate('/bookings')}
          />
        )}

        <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--clr-bg-2)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>
          <strong>ℹ️ About this deposit:</strong> The amount is set by the restaurant and applied to your bill. Cancel 24h before your booking for a full refund. This is a demo payment — no real charges are made.
        </div>
      </div>
    </div>
  );
}
