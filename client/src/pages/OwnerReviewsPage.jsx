import { useState, useEffect } from 'react';
import { restaurantAPI, reviewAPI, dishAPI } from '../services/api';
import ReviewResponseForm from '../components/ReviewResponseForm';
import { StarRating } from '../components/common';

const CRITERIA_COLORS = {
  taste: '#E8460B', hygiene: '#0BA3A3', service: '#2563EB', ambience: '#7C3AED', value: '#16A34A',
};

const PAGE_SIZE = 20;

export default function OwnerReviewsPage() {
  const [restaurant, setRestaurant]   = useState(null);
  const [reviews, setReviews]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      setLoading(true);
      setError(null);
      const restRes = await restaurantAPI.getOwnerRestaurants();
      if (!restRes.data.data?.length) { setLoading(false); return; }
      const rest = restRes.data.data[0];
      setRestaurant(rest);
      await loadReviews(rest._id, 1, true);
    } catch (err) {
      console.error(err);
      setError('Failed to load reviews. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (restaurantId, page, replace) => {
    const res = await reviewAPI.getAll({
      restaurantId,
      page,
      limit: PAGE_SIZE,
      sortBy: 'newest',
    });

    // reviewAPI.getAll returns { reviews: [...], pagination: {...} }
    const payload = res.data.data;
    const newReviews  = payload.reviews    || [];
    const pg          = payload.pagination || {};

    setReviews(prev => replace ? newReviews : [...prev, ...newReviews]);
    setTotal(pg.total || 0);
    setCurrentPage(pg.page || page);
    setHasMore((pg.page || page) < (pg.pages || 1));
  };

  const handleLoadMore = async () => {
    if (!restaurant || loadingMore) return;
    setLoadingMore(true);
    try {
      await loadReviews(restaurant._id, currentPage + 1, false);
    } catch (err) {
      console.error(err);
      setError('Failed to load more reviews.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleResponseSuccess = async () => {
    setRespondingTo(null);
    if (!restaurant) return;
    // Re-fetch the whole current set to show the updated ownerResponse
    const res = await reviewAPI.getAll({
      restaurantId: restaurant._id,
      page: 1,
      limit: currentPage * PAGE_SIZE,
      sortBy: 'newest',
    });
    const payload = res.data.data;
    setReviews(payload.reviews || []);
  };

  /* ───── Loading / empty states ───── */
  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">⭐</div>
        <div className="empty-state__title">No restaurant found</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Reviews
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: '0 0 4px' }}>
          {restaurant.name}
        </h1>
        {total > 0 && (
          <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>
            {total} {total === 1 ? 'review' : 'reviews'} — showing {reviews.length}
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: 12, background: '#FEE', color: 'var(--clr-error)', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {reviews.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {reviews.map(review => {
              const authorName = review.userId?.name || 'Anonymous';
              const initial    = authorName[0].toUpperCase();
              const isDishOnly = !review.restaurantId && review.dishId;
              const date = new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });

              return (
                <div
                  key={review._id}
                  style={{
                    background: 'white', borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--clr-border)', overflow: 'hidden'
                  }}
                >
                  {/* Author + rating row */}
                  <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #E8460B, #FFB800)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
                      }}>
                        {initial}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{authorName}</div>
                        <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{date}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StarRating value={review.rating} size="sm" />
                      <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>{review.rating}/5</div>
                    </div>
                  </div>

                  {/* Criteria sub-ratings (if any) */}
                  {review.ratings && Object.values(review.ratings).some(v => v > 0) && (
                    <div style={{
                      padding: '8px 20px 10px',
                      background: 'var(--clr-bg-alt)',
                      borderTop: '1px solid var(--clr-border)',
                      display: 'flex', gap: 16, flexWrap: 'wrap'
                    }}>
                      {Object.entries(review.ratings).map(([cat, val]) => val > 0 ? (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>{cat}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: CRITERIA_COLORS[cat] || 'var(--clr-primary)' }}>{val}★</span>
                        </div>
                      ) : null)}
                    </div>
                  )}

                  {/* Title + body */}
                  <div style={{ padding: '14px 20px' }}>
                    {review.title && (
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
                        {review.title}
                      </div>
                    )}
                    <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.7, color: 'var(--clr-text)' }}>
                      {review.content}
                    </p>

                    {/* Embedded dish-level ratings inside a restaurant review */}
                    {review.dishReviews?.length > 0 && (
                      <div style={{
                        background: 'var(--clr-bg-alt)', borderRadius: 'var(--r-md)',
                        padding: '10px 14px', marginBottom: 14
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                          Dish Ratings in this Review
                        </div>
                        {review.dishReviews.map((dr, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '3px 0', borderTop: i > 0 ? '1px solid var(--clr-border)' : 'none' }}>
                            <span style={{ color: 'var(--clr-text)' }}>{dr.dishId?.name || 'Dish'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {dr.comment && <span style={{ color: 'var(--clr-text-muted)', fontSize: 12, fontStyle: 'italic' }}>"{dr.comment}"</span>}
                              <span style={{ fontWeight: 700, color: '#E8460B' }}>{dr.rating}★</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Owner response — only for restaurant reviews */}
                    {!isDishOnly && (
                      <>
                        {review.ownerResponse ? (
                          <div style={{
                            background: '#EFF6FF', borderLeft: '3px solid #2563EB',
                            padding: '12px 14px', borderRadius: '0 var(--r-md) var(--r-md) 0', marginBottom: 10
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', marginBottom: 5 }}>Your Response</div>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--clr-text)', lineHeight: 1.6 }}>
                              {review.ownerResponse}
                            </p>
                          </div>
                        ) : (
                          <div style={{
                            background: 'var(--clr-bg-alt)', borderLeft: '3px solid var(--clr-border)',
                            padding: '9px 14px', borderRadius: '0 var(--r-md) var(--r-md) 0', marginBottom: 10,
                            fontSize: 13, color: 'var(--clr-text-muted)'
                          }}>
                            No response yet
                          </div>
                        )}

                        {respondingTo === review._id ? (
                          <ReviewResponseForm
                            review={review}
                            onSuccess={handleResponseSuccess}
                            onCancel={() => setRespondingTo(null)}
                          />
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => setRespondingTo(review._id)}>
                            {review.ownerResponse ? 'Edit Response' : 'Respond'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                className="btn btn-ghost"
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{ minWidth: 180 }}
              >
                {loadingMore
                  ? <span className="spinner" style={{ width: 16, height: 16 }} />
                  : `Load More (${total - reviews.length} remaining)`}
              </button>
            </div>
          )}

          {!hasMore && reviews.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--clr-text-muted)' }}>
              All {total} reviews loaded
            </div>
          )}
        </>
      ) : !error ? (
        <div className="empty-state">
          <div className="empty-state__icon">⭐</div>
          <div className="empty-state__title">No reviews yet</div>
          <div className="empty-state__desc">When customers review your restaurant or dishes, they will appear here.</div>
        </div>
      ) : null}
    </div>
  );
}
