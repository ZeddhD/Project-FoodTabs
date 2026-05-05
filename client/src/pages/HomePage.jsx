import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { restaurantAPI, reviewAPI, dishAPI } from '../services/api';
import { RestaurantCard, CuisineFilters, SkeletonRestaurantCard } from '../components/common';
import { useAuthStore } from '../context/store';

const SORT_OPTIONS = [
  { value: '',          label: 'Featured' },
  { value: 'rating',   label: 'Top Rated' },
  { value: 'newest',   label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
];

const PRICE_OPTIONS = [
  { value: '', label: 'Any Price' },
  { value: '$', label: '$' },
  { value: '$$', label: '$$' },
  { value: '$$$', label: '$$$' },
  { value: '$$$$', label: '$$$$' },
];

/* ── Live Review Strip ──────────────────────────────────── */
function ReviewStrip() {
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    reviewAPI.getAll({ limit: 12, sortBy: 'newest' })
      .then(res => {
        if (res.data.success) {
          const reviews = res.data.data?.reviews || res.data.data || [];
          setRecentReviews(Array.isArray(reviews) ? reviews : []);
        }
      })
      .catch(() => {});
  }, []);

  if (!recentReviews.length) return null;

  // Duplicate for seamless infinite scroll
  const items = [...recentReviews, ...recentReviews];

  return (
    <div className="review-strip" aria-label="Recent reviews">
      <div className="review-strip__label">
        <span className="pulse" />
        Live Reviews
      </div>
      <div className="review-strip__track">
        {items.map((rv, idx) => {
          const authorName = rv.userId?.name || 'Someone';
          const initial = authorName[0]?.toUpperCase() || '?';
          const restaurantName = rv.restaurantId?.name || '';
          return (
            <div key={idx} className="review-strip__card">
              <div className="review-strip__avatar">{initial}</div>
              <div className="review-strip__body">
                <div className="review-strip__name">
                  {authorName}
                  <span className="review-strip__stars">
                    {'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}
                  </span>
                </div>
                {restaurantName && (
                  <div className="review-strip__restaurant">{restaurantName}</div>
                )}
                {rv.title && (
                  <div className="review-strip__excerpt">"{rv.title}"</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);

  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cuisine, setCuisine]       = useState('');
  const [minRating, setMinRating]   = useState('');
  const [sortBy, setSortBy]         = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [dishResults, setDishResults] = useState([]);
  const [dishLoading, setDishLoading] = useState(false);

  const LIMIT = 12;

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, limit: LIMIT,
        ...(search     && { search }),
        ...(cuisine    && { cuisine }),
        ...(minRating  && { minRating }),
        ...(sortBy     && { sortBy }),
        ...(priceRange && { priceRange }),
      };
      const res = await restaurantAPI.getAll(params);
      if (res.data.success) {
        setRestaurants(res.data.data.restaurants || []);
        setTotal(res.data.data.total ?? res.data.data.pagination?.total ?? 0);
      }
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, cuisine, minRating, sortBy, priceRange]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  // Fetch dish results when search query is present
  useEffect(() => {
    if (!search || search.trim().length < 2) { setDishResults([]); return; }
    setDishLoading(true);
    dishAPI.search(search, 8)
      .then(res => setDishResults(res.data?.data || []))
      .catch(() => setDishResults([]))
      .finally(() => setDishLoading(false));
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCuisineChange = (val) => {
    setCuisine(val);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__eyebrow">✦ Restaurant Discovery Platform</div>
          <h1 className="hero__title">
            Find Your Next<br /><em>Favourite Meal</em>
          </h1>
          <p className="hero__subtitle">
            Discover top-rated restaurants near you, read honest reviews, and book your table — all in one place.
          </p>

          <form onSubmit={handleSearchSubmit}>
            <div className="search-bar">
              <span style={{ fontSize: 22, flexShrink: 0 }}>🔍</span>
              <input
                type="text"
                className="search-bar__input"
                placeholder="Search by name, cuisine, area or dish..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>
          </form>

        </div>
      </section>

      {/* ── Live Review Strip ── */}
      <ReviewStrip />

      {/* ── Content ── */}
      <div className="page" style={{ paddingTop: 32 }}>

        {/* Cuisine chips */}
        <CuisineFilters selected={cuisine} onChange={handleCuisineChange} />

        {/* Filter / Sort bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="filter-select"
              value={minRating}
              onChange={e => { setMinRating(e.target.value); setPage(1); }}
            >
              <option value="">All Ratings</option>
              <option value="4.5">★ 4.5+</option>
              <option value="4">★ 4.0+</option>
              <option value="3.5">★ 3.5+</option>
            </select>

            <select
              className="filter-select"
              value={priceRange}
              onChange={e => { setPriceRange(e.target.value); setPage(1); }}
            >
              {PRICE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {(search || cuisine || minRating || priceRange) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearch(''); setSearchInput(''); setCuisine('');
                  setMinRating(''); setPriceRange(''); setSortBy(''); setPage(1);
                  setDishResults([]);
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>
            {loading ? '' : (
              <>
                {`${total} restaurant${total !== 1 ? 's' : ''} found`}
                {search && !dishLoading && dishResults.length > 0 && (
                  <span style={{ marginLeft: 8, color: 'var(--clr-primary)', fontWeight: 600 }}>
                    · {dishResults.length} dish{dishResults.length !== 1 ? 'es' : ''} matched
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid-restaurants">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRestaurantCard key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div style={{ padding: '24px', borderRadius: 'var(--r-lg)', background: 'var(--clr-bg-2)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: search && dishResults.length > 0 ? 0 : 12 }}>
              No restaurants matched
              {search ? ` "${search}"` : ''}.
              {search && dishResults.length > 0
                ? ' See dish results below.'
                : ' Try adjusting your search or filters.'}
            </div>
            {!(search && dishResults.length > 0) && (search || cuisine || minRating || priceRange) && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 10 }}
                onClick={() => { setSearch(''); setSearchInput(''); setCuisine(''); setMinRating(''); setPriceRange(''); setSortBy(''); setPage(1); setDishResults([]); }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid-restaurants">
              {restaurants.map(r => (
                <RestaurantCard
                  key={r._id}
                  restaurant={r}
                  onClick={() => navigate(`/restaurant/${r._id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span style={{ padding: '6px 4px', color: 'var(--clr-text-muted)' }}>…</span>
                      )}
                      <button
                        className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))
                }
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Dish Results (when search query present) ── */}
        {search && search.trim().length >= 2 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
              Dishes matching "{search}"
            </h2>
            {dishLoading ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ width: 200, height: 80, borderRadius: 'var(--r-md)', background: '#f0f0f0' }} className="skeleton-shimmer" />
                ))}
              </div>
            ) : dishResults.length === 0 ? (
              <p style={{ color: 'var(--clr-text-light)', fontSize: 14 }}>No matching dishes found.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {dishResults.map(dish => (
                  <Link
                    key={dish._id}
                    to={`/dish/${dish._id}`}
                    style={{
                      background: 'white', borderRadius: 'var(--r-md)',
                      border: '1px solid var(--clr-border)',
                      padding: '14px 16px', textDecoration: 'none',
                      display: 'block', transition: 'box-shadow 0.2s',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--clr-text)' }}>{dish.name}</div>
                        {dish.restaurantId?.name && (
                          <div style={{ fontSize: 12, color: 'var(--clr-text-light)', marginTop: 2 }}>{dish.restaurantId.name}</div>
                        )}
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--clr-primary)', flexShrink: 0 }}>
                        ৳{dish.price?.toFixed(0)}
                      </span>
                    </div>
                    {dish.rating > 0 && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#E8460B', fontWeight: 600 }}>
                        {dish.rating.toFixed(1)} ★
                        <span style={{ color: 'var(--clr-text-light)', fontWeight: 400, marginLeft: 4 }}>
                          {dish.reviewsCount} review{dish.reviewsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA for non-authenticated */}
        {!isAuthenticated && !loading && (
          <div style={{
            marginTop: 64, padding: '48px 32px',
            background: 'linear-gradient(135deg, var(--clr-primary-light), var(--clr-accent-light))',
            borderRadius: 'var(--r-xl)',
            textAlign: 'center',
            border: '1px solid var(--clr-border)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍴</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12, color: 'var(--clr-dark)' }}>
              Join the Food Community
            </h2>
            <p style={{ color: 'var(--clr-text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              Write reviews, save favourites, book tables, and get personalised recommendations.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
