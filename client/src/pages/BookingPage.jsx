import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import BookingForm from '../components/BookingForm';

export default function BookingPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => { fetchRestaurant(); }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const res = await restaurantAPI.getById(restaurantId);
      setRestaurant(res.data.data.restaurant || res.data.data);
    } catch {
      setError('Failed to load restaurant details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = (booking) => {
    navigate(`/payment/${booking._id}`);
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>
  );

  if (error || !restaurant) return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px' }}>
      <div style={{ padding: 16, background: 'var(--clr-error-light)', color: 'var(--clr-error)', borderRadius: 'var(--r-md)', marginBottom: 16 }}>
        {error || 'Restaurant not found.'}
      </div>
      <Link to="/" className="btn btn-ghost">Back to Home</Link>
    </div>
  );

  const deposit = restaurant.bookingDeposit || 0;

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '32px var(--px) 60px' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← Back</button>

        {/* Restaurant info strip */}
        <div style={{
          background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)',
          padding: '20px 24px', marginBottom: 24,
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--r-md)', flexShrink: 0,
            background: 'linear-gradient(135deg, #E8460B, #FFB800)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
          }}>🍽️</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18 }}>{restaurant.name}</div>
            <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 2 }}>
              📍 {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
            </div>
            {restaurant.cuisineTypes?.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--clr-text-light)', marginTop: 2 }}>
                {restaurant.cuisineTypes.slice(0, 3).join(' · ')}
              </div>
            )}
          </div>
          {deposit > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 2 }}>DEPOSIT REQUIRED</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--clr-primary)' }}>৳{deposit.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--clr-text-light)' }}>paid after booking</div>
            </div>
          )}
        </div>

        {/* Booking form */}
        <BookingForm
          restaurantId={restaurantId}
          deposit={deposit}
          onSuccess={handleBookingSuccess}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
