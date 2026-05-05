import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dishAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { StarRating, ReviewCard, SkeletonReviewCard } from '../components/common';

const CRITERIA_COLORS = {
  taste:    '#E8460B',
  hygiene:  '#0BA3A3',
  service:  '#2563EB',
  ambience: '#7C3AED',
  value:    '#16A34A',
};

function DietaryPills({ info }) {
  if (!info) return null;
  const tags = [];
  if (info.isVegetarian) tags.push({ label: 'Veg', color: '#16A34A' });
  if (info.isVegan)      tags.push({ label: 'Vegan', color: '#16A34A' });
  if (info.isGlutenFree) tags.push({ label: 'GF', color: '#2563EB' });
  if (info.isSpicy)      tags.push({ label: 'Spicy', color: '#E8460B' });
  if (!tags.length) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
      {tags.map(t => (
        <span key={t.label} style={{
          fontSize: 11, fontWeight: 700, color: t.color,
          border: `1px solid ${t.color}`, borderRadius: 20,
          padding: '2px 9px', letterSpacing: '.3px'
        }}>{t.label}</span>
      ))}
    </div>
  );
}

export default function DishPage() {
  const { dishId } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [dish, setDish]       = useState(null);
  const [reviews, setReviews] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [revLoading, setRevLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dishAPI.getById(dishId)
      .then(res => setDish(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dishId]);

  useEffect(() => {
    if (!dish) return;
    setRevLoading(true);
    dishAPI.getReviews(dish.restaurantId?._id || dish.restaurantId, dishId, { page, limit: 10 })
      .then(res => {
        const data = res.data?.data;
        setReviews(prev => page === 1 ? (data?.reviews || []) : [...prev, ...(data?.reviews || [])]);
        setTotal(data?.total || 0);
      })
      .catch(() => {})
      .finally(() => setRevLoading(false));
  }, [dish, dishId, page]);

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ height: 24, width: 180, background: '#f0f0f0', borderRadius: 6, marginBottom: 28 }} className="skeleton-shimmer" />
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ width: 280, height: 210, borderRadius: 16, background: '#f0f0f0' }} className="skeleton-shimmer" />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ height: 32, width: '70%', background: '#f0f0f0', borderRadius: 6, marginBottom: 12 }} className="skeleton-shimmer" />
            <div style={{ height: 18, width: '40%', background: '#f0f0f0', borderRadius: 6, marginBottom: 8 }} className="skeleton-shimmer" />
            <div style={{ height: 14, width: '90%', background: '#f0f0f0', borderRadius: 6 }} className="skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="page-container" style={{ maxWidth: 860, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🍽️</div>
        <h2 style={{ marginTop: 12 }}>Dish not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Home</Link>
      </div>
    );
  }

  const restaurant = dish.restaurantId;
  const hasMore = reviews.length < total;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: 'var(--clr-text-light)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link to="/" style={{ color: 'var(--clr-primary)' }}>Home</Link>
        <span>›</span>
        {restaurant && (
          <>
            <Link to={`/restaurant/${restaurant._id}`} style={{ color: 'var(--clr-primary)' }}>
              {restaurant.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span style={{ color: 'var(--clr-text)' }}>{dish.name}</span>
      </div>

      {/* Hero */}
      <div style={{
        background: 'white', borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-md)', padding: '28px 28px 24px',
        marginBottom: 32, display: 'flex', gap: 28, flexWrap: 'wrap'
      }}>
        {/* Dish image or placeholder */}
        <div style={{
          width: 240, height: 180, borderRadius: 'var(--r-md)',
          background: 'linear-gradient(135deg, #FFF3EC, #FFE8D6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 64, overflow: 'hidden'
        }}>
          {dish.images?.[0]
            ? <img src={dish.images[0]} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🍽️'
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{dish.name}</h1>
              {restaurant && (
                <Link to={`/restaurant/${restaurant._id}`} style={{
                  fontSize: 14, color: 'var(--clr-primary)', fontWeight: 600
                }}>
                  {restaurant.name}
                  {restaurant.city && <span style={{ color: 'var(--clr-text-light)', fontWeight: 400 }}> · {restaurant.city}</span>}
                </Link>
              )}
            </div>
            <div style={{
              background: 'var(--clr-primary)', color: 'white',
              borderRadius: 'var(--r-md)', padding: '6px 14px',
              fontWeight: 800, fontSize: 18
            }}>
              ৳{dish.price?.toFixed(0)}
            </div>
          </div>

          {dish.category && (
            <span style={{
              display: 'inline-block', marginTop: 10, fontSize: 12, fontWeight: 600,
              color: 'var(--clr-text-light)', background: 'var(--clr-bg-alt)',
              borderRadius: 20, padding: '3px 10px'
            }}>{dish.category}</span>
          )}

          {dish.description && (
            <p style={{ marginTop: 10, fontSize: 14, color: 'var(--clr-text-secondary)', lineHeight: 1.6 }}>
              {dish.description}
            </p>
          )}

          <DietaryPills info={dish.dietaryInfo} />

          {dish.allergens?.length > 0 && (
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--clr-text-light)' }}>
              Allergens: {dish.allergens.join(', ')}
            </p>
          )}

          {/* Rating row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--clr-primary)' }}>
              {dish.rating > 0 ? dish.rating.toFixed(1) : '—'}
            </span>
            <div>
              <StarRating rating={dish.rating} size={16} />
              <div style={{ fontSize: 12, color: 'var(--clr-text-light)', marginTop: 2 }}>
                {dish.reviewsCount > 0 ? `${dish.reviewsCount} review${dish.reviewsCount !== 1 ? 's' : ''}` : 'No reviews yet'}
              </div>
            </div>
          </div>

          {dish.calories && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--clr-text-light)' }}>
              {dish.calories} kcal{dish.servingSize ? ` · ${dish.servingSize}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
            Customer Reviews
            {total > 0 && <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--clr-text-light)', marginLeft: 8 }}>({total})</span>}
          </h2>
          {isAuthenticated && restaurant && (
            <Link to={`/review/create?restaurantId=${restaurant._id}&dishId=${dish._id}`} className="btn btn-primary btn-sm">
              Write a Review
            </Link>
          )}
        </div>

        {revLoading && page === 1 ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonReviewCard key={i} />)
        ) : reviews.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 'var(--r-lg)', padding: '40px 24px',
            textAlign: 'center', color: 'var(--clr-text-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✍️</div>
            <p>No reviews for this dish yet. Be the first!</p>
            {isAuthenticated && restaurant && (
              <Link
                to={`/review/create?restaurantId=${restaurant._id}&dishId=${dish._id}`}
                className="btn btn-primary"
                style={{ marginTop: 14 }}
              >
                Write a Review
              </Link>
            )}
          </div>
        ) : (
          <>
            {reviews.map(rv => {
              const dishEntry = rv.dishReviews?.find(dr => {
                const id = dr.dishId?._id?.toString() || dr.dishId?.toString();
                return id === dishId;
              });
              return (
                <div key={rv._id} style={{ marginBottom: 16 }}>
                  {dishEntry?.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        background: CRITERIA_COLORS.taste, color: 'white',
                        borderRadius: 20, padding: '2px 10px',
                        fontSize: 13, fontWeight: 700
                      }}>
                        {dishEntry.rating.toFixed(1)} ★ for this dish
                      </span>
                      {dishEntry.comment && (
                        <span style={{ fontSize: 13, color: 'var(--clr-text-secondary)', fontStyle: 'italic' }}>
                          "{dishEntry.comment}"
                        </span>
                      )}
                    </div>
                  )}
                  <ReviewCard review={rv} />
                </div>
              );
            })}
            {hasMore && (
              <button
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => setPage(p => p + 1)}
                disabled={revLoading}
              >
                {revLoading ? 'Loading...' : 'Load more reviews'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
