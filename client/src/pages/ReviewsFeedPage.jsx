import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import { StarRating, VerifiedBadgeSVG, CriteriaDots, SkeletonReviewCard } from '../components/common';
import { useAuthStore } from '../context/store';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Most Recent' },
  { value: 'rating',  label: 'Highest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
];

const RATING_FILTER = [
  { value: '', label: 'All Ratings' },
  { value: '5', label: '★★★★★ (5)' },
  { value: '4', label: '★★★★☆ (4+)' },
  { value: '3', label: '★★★☆☆ (3+)' },
];

function ReviewFeedCard({ review, onNavigate }) {
  const authorName = review.userId?.name || 'Anonymous';
  const initial = authorName[0]?.toUpperCase() || '?';
  const isVerified = review.verifiedVisit || review.verifiedPurchase || review.isVerified;
  const createdAt = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const restaurantName = review.restaurantId?.name || '';
  const restaurantId   = review.restaurantId?._id || review.restaurantId;

  return (
    <div className="review-card" style={{
      cursor: 'default',
      background: '#FFFFFF',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      borderLeft: `3px solid ${
        review.rating >= 5 ? 'var(--clr-taste)' :
        review.rating >= 4 ? 'var(--clr-value)' :
        review.rating >= 3 ? 'var(--clr-accent)' : 'var(--clr-error)'
      }`,
      marginBottom: 16,
    }}>
      {/* Author + rating row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="avatar">{initial}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--clr-dark)' }}>{authorName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <StarRating value={review.rating} size="sm" />
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--clr-dark)' }}>{review.rating}/5</span>
              {createdAt && <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>· {createdAt}</span>}
              {isVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <VerifiedBadgeSVG size="sm" />
                  <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Verified</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Restaurant link */}
        {restaurantName && (
          <button
            onClick={() => onNavigate(restaurantId)}
            style={{ fontSize: 12, color: 'var(--clr-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', maxWidth: 160 }}
          >
            {restaurantName} →
          </button>
        )}
      </div>

      {review.title && (
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--clr-dark)', marginBottom: 6 }}>{review.title}</div>
      )}
      <div style={{ fontSize: 14, color: 'var(--clr-text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
        {review.content?.length > 280 ? review.content.slice(0, 280) + '…' : review.content}
      </div>

      {/* Criteria dots */}
      {review.ratings && <CriteriaDots ratings={review.ratings} />}

      {/* Photo thumbnails */}
      {review.photos?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {review.photos.slice(0, 4).map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt=""
              style={{ width: 60, height: 60, borderRadius: 'var(--r-sm)', objectFit: 'cover', border: '1px solid var(--clr-border)' }}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ReviewsFeedPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);

  const [sortBy,     setSortBy]     = useState('newest');
  const [minRating,  setMinRating]  = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const LIMIT = 15;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, limit: LIMIT, sortBy,
        ...(minRating    && { minRating }),
        ...(verifiedOnly && { verified: true }),
      };
      const res = await reviewAPI.getAll(params);
      if (res.data.success) {
        const data = res.data.data;
        setReviews(Array.isArray(data) ? data : data.reviews || []);
        setTotal(data.total ?? data.pagination?.total ?? (Array.isArray(data) ? data.length : 0));
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, minRating, verifiedOnly]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page" style={{ paddingTop: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Community Reviews
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: 'var(--clr-dark)', marginBottom: 10 }}>
          What People Are Saying
        </h1>
        <p style={{ color: 'var(--clr-text-muted)', maxWidth: 520, lineHeight: 1.6 }}>
          Real reviews from real diners. Filter by rating or browse verified visits for the most trustworthy opinions.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28, padding: '14px 16px', background: 'var(--clr-bg-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)' }}>
        <select
          className="filter-select"
          value={sortBy}
          onChange={e => { setSortBy(e.target.value); setPage(1); }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          className="filter-select"
          value={minRating}
          onChange={e => { setMinRating(e.target.value); setPage(1); }}
        >
          {RATING_FILTER.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--clr-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={e => { setVerifiedOnly(e.target.checked); setPage(1); }}
            style={{ accentColor: '#10B981' }}
          />
          <VerifiedBadgeSVG size="sm" />
          Verified visits only
        </label>

        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--clr-text-muted)' }}>
          {loading ? '' : `${total} review${total !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonReviewCard key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">💬</div>
          <div className="empty-state__title">No reviews found</div>
          <div className="empty-state__desc">Try adjusting your filters.</div>
          {isAuthenticated && (
            <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
              Find a Restaurant to Review
            </Link>
          )}
        </div>
      ) : (
        <>
          <div style={{ maxWidth: 720 }}>
            {reviews.map(review => (
              <ReviewFeedCard
                key={review._id}
                review={review}
                onNavigate={(rid) => rid && navigate(`/restaurant/${rid}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              {totalPages > 7 && page < totalPages && <span style={{ padding: '6px 4px', color: 'var(--clr-text-muted)' }}>…</span>}
              <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* CTA */}
      {!isAuthenticated && !loading && (
        <div style={{ marginTop: 48, padding: '32px', background: 'var(--clr-bg-2)', borderRadius: 'var(--r-xl)', textAlign: 'center', border: '1px solid var(--clr-border)', maxWidth: 560 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Share your own experience
          </div>
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: 16, fontSize: 14 }}>
            Sign in to write reviews and earn Verified Visit badges.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-ghost">Sign In</Link>
          </div>
        </div>
      )}
    </div>
  );
}
