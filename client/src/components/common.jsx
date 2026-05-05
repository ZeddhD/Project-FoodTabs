/* Shared UI components */
import { useAuthStore } from '../context/store';
import VoteButtons from './VoteButtons';

/* ─────────────────────────────────────────────────────────
   Verified Badge SVG  (fork motif inside shield)
   size: 'sm' | 'md' | 'lg'
───────────────────────────────────────────────────────── */
export const VerifiedBadgeSVG = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 14 : size === 'lg' ? 22 : 17;
  return (
    <svg
      width={dim} height={dim}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Verified Visit"
    >
      {/* Shield */}
      <path
        d="M10 1.5L2.5 4.5V10C2.5 14.14 5.84 17.99 10 19C14.16 17.99 17.5 14.14 17.5 10V4.5L10 1.5Z"
        fill="#10B981"
        fillOpacity="0.15"
        stroke="#10B981"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Fork tines */}
      <line x1="8" y1="5.5" x2="8" y2="8" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="10" y1="5.5" x2="10" y2="8" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="12" y1="5.5" x2="12" y2="8" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/>
      {/* Fork handle */}
      <path d="M8 8 Q9 9.5 10 8 Q11 9.5 12 8" stroke="#10B981" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <line x1="10" y1="8.5" x2="10" y2="13" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────
   Star Rating (display only, with partial fill support)
───────────────────────────────────────────────────────── */
export const StarRating = ({ value = 0, max = 5, size = 'md', interactive = false, onChange }) => {
  const px = size === 'sm' ? 14 : size === 'lg' ? 22 : 17;
  return (
    <div style={{ display: 'flex', gap: 2 }} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => i + 1).map(star => {
        const filled = star <= Math.floor(value);
        const partial = !filled && star - 1 < value && value < star;
        const pct = partial ? Math.round((value - Math.floor(value)) * 100) : 0;
        return (
          <span
            key={star}
            onClick={() => interactive && onChange?.(star)}
            style={{
              fontSize: px,
              cursor: interactive ? 'pointer' : 'default',
              position: 'relative',
              display: 'inline-block',
              lineHeight: 1,
              color: 'var(--clr-star-empty)',
            }}
          >
            ★
            {(filled || partial) && (
              <span style={{
                position: 'absolute', left: 0, top: 0,
                overflow: 'hidden',
                width: filled ? '100%' : `${pct}%`,
                color: 'var(--clr-star)',
              }}>★</span>
            )}
          </span>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Criteria Mini Bars  (used on restaurant cards)
   criteriaAverages: { taste, hygiene, service, ambience, value }
───────────────────────────────────────────────────────── */
const CRITERIA_META = [
  { key: 'taste',    label: 'Taste',    color: 'var(--clr-taste)' },
  { key: 'hygiene',  label: 'Hygiene',  color: 'var(--clr-hygiene)' },
  { key: 'service',  label: 'Service',  color: 'var(--clr-service)' },
  { key: 'ambience', label: 'Ambience', color: 'var(--clr-ambience)' },
  { key: 'value',    label: 'Value',    color: 'var(--clr-value)' },
];

export const CriteriaMiniBars = ({ criteriaAverages = {} }) => {
  const hasCriteria = CRITERIA_META.some(c => criteriaAverages[c.key] > 0);
  if (!hasCriteria) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
      {CRITERIA_META.map(({ key, label, color }) => {
        const val = criteriaAverages[key] || 0;
        if (!val) return null;
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--clr-text-muted)', width: 46, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--clr-border)', overflow: 'hidden' }}>
              <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: 10, color: 'var(--clr-text-muted)', width: 20, textAlign: 'right' }}>{val}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Criteria Dots  (used on review cards — compact colored dots)
───────────────────────────────────────────────────────── */
export const CriteriaDots = ({ ratings = {} }) => {
  const items = CRITERIA_META.filter(c => ratings[c.key] > 0);
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {items.map(({ key, label, color }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>{label} {ratings[key]}</span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Criteria Full Bars  (used on restaurant profile)
───────────────────────────────────────────────────────── */
export const CriteriaFullBars = ({ criteriaAverages = {} }) => {
  const hasCriteria = CRITERIA_META.some(c => criteriaAverages[c.key] > 0);
  if (!hasCriteria) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {CRITERIA_META.map(({ key, label, color }) => {
        const val = criteriaAverages[key] || 0;
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--clr-text-muted)', width: 64, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--clr-border)', overflow: 'hidden' }}>
              <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color, width: 28, textAlign: 'right' }}>{val || '—'}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Restaurant Card
───────────────────────────────────────────────────────── */
export const RestaurantCard = ({ restaurant, onClick }) => {
  const cuisines = restaurant.cuisineTypes?.slice(0, 2) || [];
  const emoji = getRestaurantEmoji(restaurant.cuisineTypes?.[0]);
  const hasCriteria = restaurant.criteriaAverages &&
    CRITERIA_META.some(c => restaurant.criteriaAverages[c.key] > 0);

  return (
    <div className="restaurant-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}>
      <div className="restaurant-card__img-placeholder" style={{ display: 'flex' }}>
        {emoji}
      </div>

      {/* Body */}
      <div className="restaurant-card__body">
        {/* Name row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div className="restaurant-card__name" style={{ flex: 1, marginRight: 8 }}>
            {restaurant.name}
          </div>
          {restaurant.isVerified && (
            <span className="tag tag-verified" title="Reviewed and verified by the FoodTabs team" style={{ flexShrink: 0, fontSize: 10, cursor: 'default' }}>✓ FoodTabs Verified</span>
          )}
        </div>

        {/* Dominant rating */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--clr-dark)', lineHeight: 1 }}>
            {restaurant.rating?.toFixed(1) || '—'}
          </span>
          <StarRating value={restaurant.rating} size="sm" />
          <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
            ({restaurant.reviewsCount || 0})
          </span>
        </div>

        {/* Verified review count badge */}
        {restaurant.verifiedReviewsCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <VerifiedBadgeSVG size="sm" />
            <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
              {restaurant.verifiedReviewsCount} verified visit{restaurant.verifiedReviewsCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Location + price */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
          {restaurant.city && (
            <span style={{ fontSize: 12, color: 'var(--clr-text-light)' }}>📍 {restaurant.city}</span>
          )}
          {restaurant.priceRange && (
            <span className="price-range" style={{ fontSize: 12 }}>{restaurant.priceRange}</span>
          )}
        </div>

        {/* Criteria mini bars */}
        {hasCriteria && <CriteriaMiniBars criteriaAverages={restaurant.criteriaAverages} />}

        {/* Top review excerpt */}
        {restaurant.topReview?.content && (
          <div style={{
            marginTop: 10, padding: '8px 10px',
            background: 'var(--clr-bg-alt)', borderRadius: 'var(--r-sm)',
            borderLeft: '2px solid var(--clr-star)',
            fontSize: 11, color: 'var(--clr-text-muted)', fontStyle: 'italic',
            lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            "{restaurant.topReview.content}"
          </div>
        )}

        {/* Cuisine tags */}
        <div className="restaurant-card__tags" style={{ marginTop: 8 }}>
          {cuisines.map(c => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Dish Card
───────────────────────────────────────────────────────── */
export const DishCard = ({ dish, onClick }) => {
  const di = dish.dietaryInfo || {};
  const dietBadges = [
    di.isVegetarian && { label: '🌿 Veg',   color: '#10B981' },
    di.isVegan      && { label: '🌱 Vegan',  color: '#059669' },
    di.isSpicy      && { label: '🌶 Spicy',  color: '#EF4444' },
    di.isGlutenFree && { label: 'GF',        color: '#2563EB' },
  ].filter(Boolean);

  return (
    <div className="dish-card" onClick={onClick}>
      {dish.images?.[0] ? (
        <img src={dish.images[0]} alt={dish.name} className="dish-card__img"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
      ) : null}
      <div className="dish-card__img"
        style={{
          display: dish.images?.[0] ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 32,
          background: 'linear-gradient(135deg, #FFE0CC, #FFB800)'
        }}>
        🍽
      </div>

      <div className="dish-card__body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div className="dish-card__name">{dish.name}</div>
          <div className="dish-card__price">৳{dish.price?.toFixed(0)}</div>
        </div>

        {dish.description && (
          <div className="dish-card__desc">{dish.description}</div>
        )}

        <div className="dish-card__footer">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {dietBadges.map(b => (
              <span key={b.label} style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px',
                borderRadius: 'var(--r-full)', background: `${b.color}1A`, color: b.color
              }}>{b.label}</span>
            ))}
          </div>
          {dish.rating > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--clr-text-muted)' }}>
              <span style={{ color: 'var(--clr-star)' }}>★</span>
              {dish.rating?.toFixed(1)}
              {dish.reviewsCount > 0 && <span>({dish.reviewsCount})</span>}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--clr-text-light)', fontStyle: 'italic' }}>No reviews yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Review Card
───────────────────────────────────────────────────────── */
export const ReviewCard = ({ review, onDelete, currentUserId, onReport }) => {
  const { isAuthenticated } = useAuthStore();
  const authorName = review.userId?.name || 'Anonymous';
  const initial = authorName[0]?.toUpperCase() || '?';
  const isVerified = review.verifiedVisit || review.verifiedPurchase || review.isVerified;
  const createdAt = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const hasRatings = review.ratings && CRITERIA_META.some(c => (review.ratings[c.key] || 0) > 0);

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__author">
          <div className="avatar">{initial}</div>
          <div>
            <div className="review-card__name">{authorName}</div>
            <div className="review-card__meta">
              <StarRating value={review.rating} size="sm" />
              <span style={{ fontWeight: 700, color: 'var(--clr-dark)' }}>{review.rating}/5</span>
              {createdAt && <span style={{ color: 'var(--clr-text-muted)' }}>· {createdAt}</span>}
              {isVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <VerifiedBadgeSVG size="sm" />
                  <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Verified Visit</span>
                </span>
              )}
              {review.ownerResponse && (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', background: 'var(--clr-primary-light)', padding: '2px 8px', borderRadius: 'var(--r-full)' }}>
                  ✓ Responded
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {onReport && review.userId?._id !== currentUserId && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onReport(review._id)}
              style={{ fontSize: 12, padding: '4px 10px', color: 'var(--clr-text-muted)' }}
            >
              Flag
            </button>
          )}
          {onDelete && review.userId?._id === currentUserId && (
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(review._id)}>
              Delete
            </button>
          )}
        </div>
      </div>

      {review.title && <div className="review-card__title">{review.title}</div>}
      <div className="review-card__content">{review.content}</div>

      {/* Criteria dots */}
      {hasRatings && <CriteriaDots ratings={review.ratings} />}

      {/* Photos */}
      {review.photos?.length > 0 && (
        <div className="photo-grid" style={{ marginTop: 12 }}>
          {review.photos.map((photo, idx) => (
            <div key={idx} className="photo-thumb">
              <img src={photo} alt={`Review photo ${idx + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* Helpful votes — real, from logged-in users */}
      {isAuthenticated && (
        <div style={{ marginTop: 12 }}>
          <VoteButtons
            parentId={review._id}
            parentType="Review"
            initialScore={review.likeCount || 0}
          />
        </div>
      )}

      {/* Owner response */}
      {(review.ownerResponse || review.ownerReply?.content) && (
        <div style={{
          marginTop: 12, padding: '12px 14px',
          background: 'var(--clr-bg-2)', borderRadius: 'var(--r-md)',
          borderLeft: '3px solid var(--clr-primary)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', marginBottom: 4 }}>
            Owner Response
          </div>
          <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>
            {review.ownerResponse || review.ownerReply.content}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Skeleton Cards (shimmer loading state)
───────────────────────────────────────────────────────── */
export const SkeletonRestaurantCard = () => (
  <div className="restaurant-card" style={{ pointerEvents: 'none' }}>
    <div className="restaurant-card__img skeleton" />
    <div className="restaurant-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="skeleton" style={{ height: 18, width: '70%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 28, width: '40%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 12, width: '55%', borderRadius: 4 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="skeleton" style={{ height: 10, width: 46, borderRadius: 2 }} />
            <div className="skeleton" style={{ flex: 1, height: 4, borderRadius: 2 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 'var(--r-full)' }} />
        <div className="skeleton" style={{ height: 22, width: 50, borderRadius: 'var(--r-full)' }} />
      </div>
    </div>
  </div>
);

export const SkeletonReviewCard = () => (
  <div className="review-card" style={{ pointerEvents: 'none' }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton" style={{ height: 13, width: '40%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '60%', borderRadius: 4 }} />
      </div>
    </div>
    <div className="skeleton" style={{ height: 15, width: '65%', borderRadius: 4, marginBottom: 8 }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="skeleton" style={{ height: 12, width: '100%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 12, width: '90%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 12, width: '75%', borderRadius: 4 }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   Search Bar
───────────────────────────────────────────────────────── */
export const SearchBar = ({ onSearch, initialSearch = '' }) => {
  return (
    <div className="search-bar">
      <span style={{ fontSize: 20, flexShrink: 0 }}>🔍</span>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search restaurants, cuisines, dishes..."
        defaultValue={initialSearch}
        onChange={e => onSearch(e.target.value)}
      />
      <button className="btn btn-primary" onClick={() => {}}>
        Search
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Cuisine Filter Chips
───────────────────────────────────────────────────────── */
export const CuisineFilters = ({ selected, onChange }) => {
  const cuisines = [
    'All', 'Biriyani', 'Bangladeshi', 'Street Food', 'Mughlai',
    'BBQ', 'Seafood', 'Japanese', 'Italian', 'Chinese',
    'Healthy', 'Desserts', 'Continental'
  ];

  return (
    <div className="filters-row">
      {cuisines.map(c => (
        <button
          key={c}
          className={`filter-chip${selected === c || (c === 'All' && !selected) ? ' active' : ''}`}
          onClick={() => onChange(c === 'All' ? '' : c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function getRestaurantEmoji(cuisine) {
  const map = {
    Biriyani: '🍚', Bangladeshi: '🍛', 'Street Food': '🌮', Mughlai: '🍖',
    BBQ: '🔥', Seafood: '🦞', Japanese: '🍣', Italian: '🍝',
    Chinese: '🥢', Healthy: '🥗', Desserts: '🧁', Continental: '🍽️',
    Sushi: '🍣', Pizza: '🍕', Ramen: '🍜', Grills: '🥩',
  };
  return map[cuisine] || '🍽️';
}
