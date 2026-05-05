import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { restaurantAPI, reviewAPI, favoriteAPI, dishAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { ReviewCard, StarRating, CriteriaFullBars, VerifiedBadgeSVG, SkeletonReviewCard } from '../components/common';
import ReportModal from '../components/ReportModal';

const CRITERIA_COLORS = {
  taste: '#E8460B', hygiene: '#0BA3A3', service: '#2563EB', ambience: '#7C3AED', value: '#16A34A',
};

function ExpandedDishReviews({ restaurantId, dish }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dishAPI.getReviews(restaurantId, dish._id, { limit: 3 })
      .then(res => setReviews(res.data?.data?.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId, dish._id]);

  if (loading) return (
    <div style={{ padding: '12px 0', color: 'var(--clr-text-light)', fontSize: 13 }}>Loading reviews...</div>
  );
  if (!reviews.length) return (
    <div style={{ padding: '12px 0', color: 'var(--clr-text-light)', fontSize: 13 }}>No reviews for this dish yet.</div>
  );

  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {reviews.map(rv => (
        <div key={rv._id} style={{
          background: 'var(--clr-bg-alt)', borderRadius: 'var(--r-md)',
          padding: '12px 14px', fontSize: 13
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8460B, #FFB800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {(rv.userId?.name || 'U')[0].toUpperCase()}
            </span>
            <span style={{ fontWeight: 600 }}>{rv.userId?.name || 'Anonymous'}</span>
            {rv.dishRating && (
              <span style={{ color: CRITERIA_COLORS.taste, fontWeight: 700 }}>
                {rv.dishRating} ★
              </span>
            )}
          </div>
          {rv.dishComment && (
            <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 4, fontStyle: 'italic' }}>"{rv.dishComment}"</p>
          )}
          {rv.content && (
            <p style={{ color: 'var(--clr-text-light)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {rv.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function DishGridCard({ dish, restaurantId, isAuthenticated, onReview }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'white', borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
      border: '1px solid var(--clr-border)',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Link to={`/dish/${dish._id}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--clr-text)', textDecoration: 'none' }}>
              {dish.name}
            </Link>
            {dish.category && (
              <span style={{ display: 'inline-block', marginLeft: 8, fontSize: 11, color: 'var(--clr-text-light)', background: 'var(--clr-bg-alt)', borderRadius: 20, padding: '1px 8px' }}>
                {dish.category}
              </span>
            )}
            {dish.description && (
              <p style={{ fontSize: 12, color: 'var(--clr-text-light)', marginTop: 4, lineHeight: 1.5 }}>
                {dish.description}
              </p>
            )}
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--clr-primary)', flexShrink: 0 }}>
            ৳{dish.price?.toFixed(0)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          {dish.rating > 0 ? (
            <>
              <span style={{ fontWeight: 700, fontSize: 14, color: CRITERIA_COLORS.taste }}>
                {dish.rating.toFixed(1)} ★
              </span>
              <span style={{ fontSize: 12, color: 'var(--clr-text-light)' }}>
                {dish.reviewsCount} review{dish.reviewsCount !== 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--clr-text-light)' }}>No reviews yet</span>
          )}
          <div style={{ flex: 1 }} />
          {isAuthenticated && (
            <button
              onClick={() => onReview(dish._id)}
              style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-primary)', background: 'none', border: '1px solid var(--clr-primary)', borderRadius: 20, padding: '2px 10px', cursor: 'pointer' }}
            >
              Review
            </button>
          )}
          {dish.reviewsCount > 0 && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-light)', background: 'none', border: '1px solid var(--clr-border)', borderRadius: 20, padding: '2px 10px', cursor: 'pointer' }}
            >
              {expanded ? 'Hide' : 'See reviews'}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--clr-border)', padding: '0 16px 16px' }}>
          <ExpandedDishReviews restaurantId={restaurantId} dish={dish} />
        </div>
      )}
    </div>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes]         = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favId, setFavId]           = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeDishFilter, setActiveDishFilter] = useState('all');
  const [activeReviewDish, setActiveReviewDish] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const reviewsRef = useRef(null);

  useEffect(() => { fetchRestaurantDetails(); }, [id]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchRestaurantDetails = async () => {
    setLoading(true);
    try {
      const res = await restaurantAPI.getById(id);
      if (res.data.success) {
        const { restaurant: data, dishes: dishList, recentReviews } = res.data.data;
        setRestaurant(data);
        setDishes(dishList || []);
        setReviews(recentReviews || []);

        if (isAuthenticated) {
          try {
            const favRes = await favoriteAPI.check({ restaurantId: id, type: 'restaurant' });
            setIsFavorited(favRes.data.data.isFavorited);
            setFavId(favRes.data.data.favoriteId);
          } catch {}
        }
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      if (isFavorited && favId) {
        await favoriteAPI.remove(favId);
        setIsFavorited(false); setFavId(null);
        showNotification('Removed from favourites');
      } else {
        const res = await favoriteAPI.add({ restaurantId: id, type: 'restaurant' });
        setIsFavorited(true); setFavId(res.data.data._id);
        showNotification('Added to favourites');
      }
    } catch {}
  };

  if (loading) {
    return (
      <div>
        <div style={{ height: 320, background: 'linear-gradient(135deg, #EDE9E4, #F5F3F0)' }} className="skeleton" />
        <div className="page" style={{ paddingTop: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => <SkeletonReviewCard key={i} />)}
            </div>
            <div className="skeleton" style={{ height: 240, borderRadius: 'var(--r-lg)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🍽️</div>
        <div className="empty-state__title">Restaurant not found</div>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Home</Link>
      </div>
    );
  }

  const verifiedCount = restaurant.verifiedReviewsCount || 0;
  const totalReviews  = restaurant.reviewsCount || 0;
  const hasCriteria   = restaurant.criteriaAverages &&
    ['taste','hygiene','service','ambience','value'].some(k => restaurant.criteriaAverages[k] > 0);

  const today = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()];
  const todayHours = restaurant.openingHours?.[today];
  const hoursText = todayHours?.open ? `${todayHours.open} – ${todayHours.close}` : 'Closed today';

  // Categories for dish filter pills
  const dishCategories = ['all', ...new Set(dishes.map(d => d.category).filter(Boolean))];
  const filteredDishes = activeDishFilter === 'all' ? dishes : dishes.filter(d => d.category === activeDishFilter);

  // Filter reviews by dish
  const reviewedDishIds = [...new Set(
    reviews.flatMap(rv => (rv.dishReviews || []).map(dr => dr.dishId?.toString()))
      .filter(Boolean)
  )];
  const dishFilterOptions = dishes.filter(d => reviewedDishIds.includes(d._id?.toString()));

  const filteredReviews = activeReviewDish
    ? reviews.filter(rv => rv.dishReviews?.some(dr => dr.dishId?.toString() === activeReviewDish))
    : reviews;

  return (
    <div>
      {/* Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 300,
          padding: '12px 20px', borderRadius: 'var(--r-md)',
          background: notification.type === 'success' ? 'var(--clr-success)' : 'var(--clr-error)',
          color: 'white', fontWeight: 600, fontSize: 14,
          boxShadow: 'var(--shadow-lg)',
        }}>
          {notification.msg}
        </div>
      )}

      {/* Hero */}
      <div className="restaurant-hero">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #3D1A08 50%, #E8460B 100%)',
          display: restaurant.coverImage ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80
        }}>🍽️</div>
        <div className="restaurant-hero__overlay" />
        <div className="restaurant-hero__info" style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 className="restaurant-hero__name">{restaurant.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <StarRating value={restaurant.rating} size="sm" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>{restaurant.rating?.toFixed(1)}</span>
                <span style={{ fontSize: 13, opacity: 0.75 }}>({totalReviews} reviews)</span>
                {restaurant.isVerified && (
                  <span
                    title="This restaurant has been reviewed and verified by the FoodTabs team"
                    style={{ padding: '3px 10px', borderRadius: 'var(--r-full)', background: 'rgba(16,185,129,0.25)', color: '#6EE7B7', fontSize: 12, fontWeight: 700, cursor: 'default' }}
                  >
                    ✓ FoodTabs Verified
                  </span>
                )}
                {restaurant.cuisineTypes?.slice(0, 2).map(c => (
                  <span key={c} style={{ padding: '3px 10px', borderRadius: 'var(--r-full)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 12, fontWeight: 600 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={handleFavoriteToggle}
                className={`btn ${isFavorited ? 'btn-danger' : 'btn-ghost'}`}
                style={isFavorited ? {} : { background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                {isFavorited ? '❤️ Saved' : '🤍 Save'}
              </button>
              <Link to={`/restaurant/${id}/book`} className="btn btn-primary">Reserve a Table</Link>
              <Link to={`/restaurant/${id}/event`} className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                Book Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Meta bar */}
      <div className="restaurant-meta-bar">
        <div className="restaurant-meta-item">📍 <strong>{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</strong></div>
        {restaurant.phone && <div className="restaurant-meta-item">📞 <strong>{restaurant.phone}</strong></div>}
        {restaurant.priceRange && <div className="restaurant-meta-item">💰 <strong>{restaurant.priceRange}</strong></div>}
        <div className="restaurant-meta-item">🕐 <strong>{hoursText}</strong></div>
        {restaurant.website && (
          <a href={restaurant.website} target="_blank" rel="noreferrer" className="restaurant-meta-item" style={{ color: 'var(--clr-primary)', textDecoration: 'none' }}>
            🌐 <strong>Website</strong>
          </a>
        )}
      </div>

      {/* Main content — single scroll */}
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '32px var(--px) 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* ── Photo gallery ── */}
            {restaurant.images?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--clr-dark)' }}>
                  Photos
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: restaurant.images.length === 1 ? '1fr' : restaurant.images.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)',
                  gap: 8,
                }}>
                  {restaurant.images.slice(0, 6).map((src, i) => (
                    <div key={i} style={{
                      aspectRatio: '4/3', borderRadius: 'var(--r-md)', overflow: 'hidden',
                      background: 'var(--clr-bg-alt)', position: 'relative',
                    }}>
                      <img
                        src={src}
                        alt={`${restaurant.name} photo ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;background:var(--clr-bg-alt)">🖼️</div>';
                        }}
                      />
                      {i === 5 && restaurant.images.length > 6 && (
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: 20,
                        }}>
                          +{restaurant.images.length - 6} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Rating block ── */}
            <div style={{ marginBottom: 32, padding: '24px', background: 'var(--clr-bg-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 900, color: 'var(--clr-dark)', lineHeight: 1 }}>
                    {restaurant.rating?.toFixed(1) || '—'}
                  </div>
                  <StarRating value={restaurant.rating} size="lg" />
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>out of 5</div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--clr-dark)' }}>{totalReviews}</div>
                      <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Total Reviews</div>
                    </div>
                    {verifiedCount > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <VerifiedBadgeSVG size="md" />
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#059669' }}>{verifiedCount}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Verified Visits</div>
                      </div>
                    )}
                  </div>
                  {hasCriteria && <CriteriaFullBars criteriaAverages={restaurant.criteriaAverages} />}
                </div>
              </div>
              {hasCriteria && (() => {
                const ca = restaurant.criteriaAverages;
                const ranked = ['taste','hygiene','service','ambience','value']
                  .map(k => ({ k, v: ca[k] || 0 })).filter(x => x.v > 0).sort((a,b) => b.v - a.v);
                if (!ranked.length) return null;
                const best  = ranked[0];
                const worst = ranked[ranked.length - 1];
                const labels = { taste:'Taste', hygiene:'Hygiene', service:'Service', ambience:'Ambience', value:'Value' };
                const COLORS = { taste:'#E8460B', hygiene:'#0BA3A3', service:'#2563EB', ambience:'#7C3AED', value:'#16A34A' };
                return (
                  <div style={{ marginTop: 16, fontSize: 13, color: 'var(--clr-text-muted)', lineHeight: 1.7 }}>
                    Customers consistently rate{' '}
                    <strong style={{ color: COLORS[best.k], fontStyle: 'normal' }}>{labels[best.k]}</strong>{' '}
                    highest here ({best.v}/5).
                    {ranked.length > 1 && best.k !== worst.k && (
                      <>{' '}<strong style={{ color: COLORS[worst.k], fontStyle: 'normal' }}>{labels[worst.k]}</strong>{' '}
                      has the most room for improvement ({worst.v}/5).</>
                    )}
                    {verifiedCount > 0 && ` ${verifiedCount} of ${totalReviews} reviews are from verified visitors.`}
                  </div>
                );
              })()}
            </div>

            {/* ── About ── */}
            {restaurant.description && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>About</h2>
                <p style={{ color: 'var(--clr-text-muted)', lineHeight: 1.75 }}>{restaurant.description}</p>
              </div>
            )}

            {/* ── Menu / Dishes ── */}
            {dishes.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>
                    Menu
                    <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--clr-text-light)', marginLeft: 8 }}>
                      {dishes.length} items
                    </span>
                  </h2>
                  {isAuthenticated && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/review/create?restaurantId=${id}`)}>
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Category filter pills */}
                {dishCategories.length > 2 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                    {dishCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveDishFilter(cat)}
                        style={{
                          flexShrink: 0, padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          border: activeDishFilter === cat ? 'none' : '1px solid var(--clr-border)',
                          background: activeDishFilter === cat ? 'var(--clr-primary)' : 'white',
                          color: activeDishFilter === cat ? 'white' : 'var(--clr-text)',
                          cursor: 'pointer'
                        }}
                      >
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {filteredDishes.map(dish => (
                    <DishGridCard
                      key={dish._id}
                      dish={dish}
                      restaurantId={id}
                      isAuthenticated={isAuthenticated}
                      onReview={dishId => navigate(`/review/create?restaurantId=${id}&dishId=${dishId}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Reviews ── */}
            <div ref={reviewsRef}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>
                  Reviews
                  <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--clr-text-light)', marginLeft: 8 }}>
                    {totalReviews} {totalReviews !== 1 ? 'reviews' : 'review'}
                    {verifiedCount > 0 && (
                      <span style={{ color: '#059669', marginLeft: 6 }}>· {verifiedCount} verified</span>
                    )}
                  </span>
                </h2>
                {isAuthenticated && (
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/review/create?restaurantId=${id}`)}>
                    Write a Review
                  </button>
                )}
              </div>

              {/* Dish filter pills for reviews */}
              {dishFilterOptions.length > 0 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                  <button
                    onClick={() => setActiveReviewDish(null)}
                    style={{
                      flexShrink: 0, padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: !activeReviewDish ? 'none' : '1px solid var(--clr-border)',
                      background: !activeReviewDish ? 'var(--clr-dark)' : 'white',
                      color: !activeReviewDish ? 'white' : 'var(--clr-text)',
                      cursor: 'pointer'
                    }}
                  >
                    All dishes
                  </button>
                  {dishFilterOptions.map(dish => (
                    <button
                      key={dish._id}
                      onClick={() => setActiveReviewDish(dish._id?.toString())}
                      style={{
                        flexShrink: 0, padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        border: activeReviewDish === dish._id?.toString() ? 'none' : '1px solid var(--clr-border)',
                        background: activeReviewDish === dish._id?.toString() ? CRITERIA_COLORS.taste : 'white',
                        color: activeReviewDish === dish._id?.toString() ? 'white' : 'var(--clr-text)',
                        cursor: 'pointer'
                      }}
                    >
                      {dish.name}
                    </button>
                  ))}
                </div>
              )}

              {reviewsLoading ? (
                [1,2,3].map(i => <SkeletonReviewCard key={i} />)
              ) : filteredReviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__icon">💬</div>
                  <div className="empty-state__title">No reviews yet</div>
                  <div className="empty-state__desc">Be the first to share your experience!</div>
                  {isAuthenticated && (
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(`/review/create?restaurantId=${id}`)}>
                      Write the First Review
                    </button>
                  )}
                </div>
              ) : filteredReviews.length === 0 && activeReviewDish ? (
                <div className="empty-state">
                  <div className="empty-state__icon">🍽️</div>
                  <div className="empty-state__title">No reviews for this dish yet</div>
                  <div className="empty-state__desc">This dish has not been reviewed yet. Ordered it? Tell people what you thought — dish-level reviews are the most useful thing on this platform.</div>
                  {isAuthenticated && (
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(`/review/create?restaurantId=${id}`)}>
                      Be the First to Review It
                    </button>
                  )}
                </div>
              ) : (
                filteredReviews.map(review => {
                  // Attach dish pills to each review card
                  const dishPills = (review.dishReviews || []).map(dr => {
                    const dish = dishes.find(d => d._id?.toString() === dr.dishId?.toString());
                    return dish ? { name: dish.name, rating: dr.rating, dishId: dr.dishId } : null;
                  }).filter(Boolean);

                  return (
                    <div key={review._id} style={{ marginBottom: 4 }}>
                      {dishPills.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          {dishPills.map(dp => (
                            <Link
                              key={dp.dishId}
                              to={`/dish/${dp.dishId}`}
                              style={{
                                fontSize: 11, fontWeight: 600, color: CRITERIA_COLORS.taste,
                                border: `1px solid ${CRITERIA_COLORS.taste}33`,
                                borderRadius: 20, padding: '2px 9px', textDecoration: 'none',
                                background: `${CRITERIA_COLORS.taste}0D`
                              }}
                            >
                              {dp.name} · {dp.rating}★
                            </Link>
                          ))}
                        </div>
                      )}
                      <ReviewCard
                        review={review}
                        currentUserId={user?._id}
                        onReport={isAuthenticated ? (id) => setReportTarget({ type: 'review', id }) : undefined}
                      />
                    </div>
                  );
                })
              )}
              {/* Bottom CTA */}
              {!isAuthenticated && (
                <div style={{
                  marginTop: 32, padding: '24px', textAlign: 'center',
                  background: 'var(--clr-bg-2)', borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--clr-border)'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 12 }}>
                    Visited this restaurant? Your review helps everyone else decide.
                  </div>
                  <Link to="/login" className="btn btn-primary btn-sm">Sign In to Write a Review</Link>
                </div>
              )}
              {isAuthenticated && filteredReviews.length > 0 && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <button className="btn btn-primary" onClick={() => navigate(`/review/create?restaurantId=${id}`)}>
                    Write a Review
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-text-muted)' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to={`/restaurant/${id}/book`} className="btn btn-primary btn-block">Reserve a Table</Link>
                  {restaurant.bookingDeposit > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', textAlign: 'center', marginTop: -4 }}>
                      ৳{restaurant.bookingDeposit.toLocaleString()} deposit required at booking
                    </div>
                  )}
                  <Link to={`/restaurant/${id}/event`} className="btn btn-secondary btn-block">Book an Event</Link>
                  {isAuthenticated && (
                    <button className="btn btn-ghost btn-block" onClick={() => navigate(`/review/create?restaurantId=${id}`)}>
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-text-muted)' }}>
                  Details
                </h3>
                {restaurant.cuisineTypes?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 4 }}>Cuisines</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {restaurant.cuisineTypes.map(c => <span key={c} className="tag">{c}</span>)}
                    </div>
                  </div>
                )}
                {restaurant.openingHours && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 6 }}>Hours</div>
                    {['saturday','sunday','monday','tuesday','wednesday','thursday','friday'].map(day => {
                      const h = restaurant.openingHours[day];
                      if (!h) return null;
                      return (
                        <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0', color: day === today ? 'var(--clr-dark)' : 'var(--clr-text-muted)', fontWeight: day === today ? 600 : 400 }}>
                          <span style={{ textTransform: 'capitalize' }}>{day.slice(0,3)}</span>
                          <span>{h.open ? `${h.open}–${h.close}` : 'Closed'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} />
    </div>
  );
}
