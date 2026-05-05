import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { reviewAPI, bookingAPI, favoriteAPI } from '../services/api';
import UserProfileForm from '../components/UserProfileForm';
import { ReviewCard, VerifiedBadgeSVG, StarRating } from '../components/common';

export default function UserProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ reviewsCount: 0, verifiedCount: 0, bookingsCount: 0, favoritesCount: 0 });
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user?._id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, bookingsRes, favoritesRes] = await Promise.allSettled([
        reviewAPI.getAll({ userId: user?._id, limit: 100 }),
        bookingAPI.getAll({ limit: 100 }),
        favoriteAPI.getAll(),
      ]);

      const myReviews = reviewsRes.status === 'fulfilled'
        ? (reviewsRes.value.data?.data?.reviews || reviewsRes.value.data?.data || [])
        : [];

      const myBookings = bookingsRes.status === 'fulfilled'
        ? (bookingsRes.value.data?.data?.bookings || bookingsRes.value.data?.data || [])
        : [];

      const myFavorites = favoritesRes.status === 'fulfilled'
        ? (favoritesRes.value.data?.data?.favorites || favoritesRes.value.data?.data || [])
        : [];

      setReviews(Array.isArray(myReviews) ? myReviews : []);
      setStats({
        reviewsCount:   Array.isArray(myReviews)   ? myReviews.length   : 0,
        verifiedCount:  Array.isArray(myReviews)   ? myReviews.filter(rv => rv.verifiedVisit || rv.isVerified).length : 0,
        bookingsCount:  Array.isArray(myBookings)  ? myBookings.length  : 0,
        favoritesCount: Array.isArray(myFavorites) ? myFavorites.length : 0,
      });
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setLoading(false);
      setReviewsLoading(false);
    }
  };

  const handleSaveProfile = (updatedUser) => {
    setUser(updatedUser);
    setIsEditing(false);
    setTimeout(() => window.location.reload(), 800);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: '60px auto', padding: '0 24px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">👤</div>
        <div className="empty-state__title">Please sign in to view your profile</div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, rv) => s + rv.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 60px' }}>
      {isEditing ? (
        <UserProfileForm user={user} onSave={handleSaveProfile} onCancel={() => setIsEditing(false)} />
      ) : (
        <>
          {/* ── Profile header ── */}
          <div style={{
            background: 'white', borderRadius: 'var(--r-lg)',
            border: '1px solid var(--clr-border)', padding: '24px',
            marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #E8460B, #FFB800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white'
            }}>
              {(user.name || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--clr-dark)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 2 }}>{user.email}</div>
              {user.bio && (
                <div style={{ fontSize: 13, color: 'var(--clr-text)', fontStyle: 'italic', marginTop: 6 }}>"{user.bio}"</div>
              )}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>

          {/* ── Review-first stats ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12, marginBottom: 28
          }}>
            {[
              {
                value: stats.reviewsCount,
                label: 'Reviews Written',
                color: '#E8460B',
                icon: '⭐',
                sub: avgRating ? `Avg. ${avgRating}/5` : null
              },
              {
                value: stats.verifiedCount,
                label: 'Verified Visits',
                color: '#059669',
                icon: null,
                badge: true
              },
              {
                value: stats.bookingsCount,
                label: 'Bookings Made',
                color: '#2563EB',
                icon: '📅'
              },
              {
                value: stats.favoritesCount,
                label: 'Saved Restaurants',
                color: '#7C3AED',
                icon: '❤️'
              },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'white', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--clr-border)', padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {stat.badge ? <VerifiedBadgeSVG size="md" /> : <span>{stat.icon}</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>{stat.label}</div>
                {stat.sub && <div style={{ fontSize: 11, color: stat.color, fontWeight: 600, marginTop: 2 }}>{stat.sub}</div>}
              </div>
            ))}
          </div>

          {/* ── My Reviews (primary content) ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, margin: 0 }}>
                My Reviews
                {stats.reviewsCount > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--clr-text-light)', marginLeft: 8 }}>
                    {stats.reviewsCount} {stats.reviewsCount !== 1 ? 'reviews' : 'review'}
                  </span>
                )}
              </h2>
            </div>

            {reviewsLoading ? (
              <div style={{ color: 'var(--clr-text-muted)', fontSize: 14 }}>Loading your reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">✍️</div>
                <div className="empty-state__title">You have not written any reviews yet</div>
                <div className="empty-state__desc">
                  Every restaurant you visit is an opportunity to help someone else make a better decision.
                </div>
                <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Discover Restaurants</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.map(rv => (
                  <div key={rv._id}>
                    {rv.restaurantId?.name && (
                      <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 4, paddingLeft: 4 }}>
                        📍 {rv.restaurantId.name}
                      </div>
                    )}
                    <ReviewCard review={rv} currentUserId={user._id} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Cuisine preferences ── */}
          {user.preferences?.cuisines?.length > 0 && (
            <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
                Cuisine Preferences
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {user.preferences.cuisines.map(c => (
                  <span key={c} className="tag">{c}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
