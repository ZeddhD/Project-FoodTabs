import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/store.js';
import { recommendationAPI } from '../services/api.js';
import { RestaurantCard } from '../components/common';

// ── Skeleton loaders ─────────────────────────────────────────────────────────

function RestaurantSkeletons({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: 16 }}>
          <div className="skeleton" style={{ height: 120, borderRadius: 'var(--r-md)', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 14, width: '65%', borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '45%', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

function DishSkeletons({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: 16 }}>
          <div className="skeleton" style={{ height: 10, width: '40%', borderRadius: 4, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 15, width: '80%', borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 11, width: '55%', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ eyebrow, title, sub, children }) {
  return (
    <section>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          {eyebrow}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 900, color: 'var(--clr-dark)', margin: 0 }}>
          {title}
        </h2>
        {sub && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

// ── Dish card ────────────────────────────────────────────────────────────────

function DishCard({ dish }) {
  const navigate = useNavigate();
  const rest = dish.restaurantId;
  const dietTags = [];
  if (dish.dietaryInfo?.isVegetarian) dietTags.push('Veg');
  if (dish.dietaryInfo?.isVegan)      dietTags.push('Vegan');
  if (dish.dietaryInfo?.isSpicy)      dietTags.push('Spicy');

  return (
    <div
      onClick={() => navigate(`/restaurant/${rest?._id}`)}
      style={{
        background: 'white', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--clr-border)', padding: '16px 18px',
        cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--clr-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--clr-border)'; }}
    >
      {/* Category + dietary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {dish.category || 'Dish'}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {dietTags.map(t => (
            <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Name */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--clr-dark)', marginBottom: 4, lineHeight: 1.2 }}>
        {dish.name}
      </div>

      {/* Description */}
      {dish.description && (
        <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {dish.description}
        </div>
      )}

      {/* Price + rating */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--clr-primary)' }}>
          ৳{dish.price?.toLocaleString()}
        </span>
        {dish.rating > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>★ {dish.rating.toFixed(1)}</span>
        )}
      </div>

      {/* Restaurant attribution */}
      {rest && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--clr-border)', fontSize: 11, color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>📍</span>
          <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{rest.name}</span>
          {rest.isVerified && <span style={{ color: '#2563EB', fontSize: 10 }}>✓</span>}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const userId = user?._id || user?.userId;

  const [profile, setProfile]           = useState(null);
  const [dishes, setDishes]             = useState([]);
  const [smart, setSmart]               = useState([]);
  const [trending, setTrending]         = useState([]);
  const [similarUsers, setSimilarUsers] = useState([]);

  const [loadingProfile, setLoadingProfile]   = useState(true);
  const [loadingDishes, setLoadingDishes]     = useState(true);
  const [loadingSmart, setLoadingSmart]       = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSimilar, setLoadingSimilar]   = useState(true);

  useEffect(() => {
    if (!userId) return;

    recommendationAPI.getTasteProfile()
      .then(res => setProfile(res.data.data || null))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));

    recommendationAPI.getRecommendedDishes({ limit: 8 })
      .then(res => setDishes(res.data.data || []))
      .catch(() => setDishes([]))
      .finally(() => setLoadingDishes(false));

    recommendationAPI.getSmartRecommendations({ limit: 6 })
      .then(res => setSmart(res.data.data || []))
      .catch(() => setSmart([]))
      .finally(() => setLoadingSmart(false));

    recommendationAPI.getTrending({ limit: 4, days: 30 })
      .then(res => setTrending(res.data.data || []))
      .catch(() => setTrending([]))
      .finally(() => setLoadingTrending(false));

    recommendationAPI.getSimilarUsers({ limit: 3 })
      .then(res => setSimilarUsers(res.data.data || []))
      .catch(() => setSimilarUsers([]))
      .finally(() => setLoadingSimilar(false));
  }, [userId]);

  const firstName = user?.name?.split(' ')[0] || 'Foodie';

  return (
    <div style={{ background: 'var(--clr-bg)', minHeight: '100vh' }}>

      {/* ── Hero: taste profile derived from history ── */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--clr-border)', padding: '26px var(--px) 22px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Personalised
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, margin: '0 0 4px' }}>
            For You, {firstName}
          </h1>

          {loadingProfile ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[80, 60, 70, 55].map(w => (
                <div key={w} className="skeleton" style={{ height: 26, width: w, borderRadius: 20 }} />
              ))}
            </div>
          ) : profile?.hasHistory ? (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--clr-text-muted)' }}>
                Based on your {profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''}
                {profile.favoriteCount > 0 && ` and ${profile.favoriteCount} saved restaurant${profile.favoriteCount !== 1 ? 's' : ''}`}.
                {profile.avgRating && ` You typically rate ★ ${profile.avgRating}/5.`}
              </p>
              {profile.topCuisines.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--clr-text-muted)', fontWeight: 600 }}>Your top cuisines:</span>
                  {profile.topCuisines.map(c => (
                    <span key={c} className="tag">{c}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>
              Start reviewing restaurants to personalise your feed.{' '}
              <Link to="/" style={{ color: 'var(--clr-primary)', fontWeight: 600, textDecoration: 'none' }}>Discover restaurants →</Link>
            </p>
          )}
        </div>
      </div>

      {/* ── Feed ── */}
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '36px var(--px) 64px', display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* Dishes to try */}
        <Section
          eyebrow="Dishes to Try"
          title="On the Menu For You"
          sub={profile?.hasHistory
            ? 'Top-rated dishes from restaurants that match your taste history.'
            : 'Highly rated dishes from across our restaurants.'}
        >
          {loadingDishes ? <DishSkeletons count={4} /> : dishes.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {dishes.map(d => <DishCard key={d._id} dish={d} />)}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state__icon">🍽️</div>
              <div className="empty-state__title">No dish suggestions yet</div>
              <div className="empty-state__desc">Review or favourite some restaurants to get personalised dish picks.</div>
            </div>
          )}
        </Section>

        {/* Smart restaurant picks */}
        <Section
          eyebrow="Restaurants"
          title="Places You'd Love"
          sub="Restaurants you haven't visited yet, scored against your dining history."
        >
          {loadingSmart ? <RestaurantSkeletons count={3} /> : smart.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {smart.map(r => (
                <RestaurantCard key={r._id} restaurant={r} onClick={() => navigate(`/restaurant/${r._id}`)} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state__icon">🗺️</div>
              <div className="empty-state__title">Nothing to suggest yet</div>
              <div className="empty-state__desc">Write a few reviews or save favourites and we'll start personalising this section.</div>
              <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Discover Restaurants</Link>
            </div>
          )}
        </Section>

        {/* Trending */}
        <Section
          eyebrow="Hot Right Now"
          title="Trending This Month"
          sub="Most-reviewed restaurants over the last 30 days."
        >
          {loadingTrending ? <RestaurantSkeletons count={4} /> : trending.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {trending.map((r, i) => (
                <div key={r._id} style={{ position: 'relative' }}>
                  {i < 3 && (
                    <div style={{
                      position: 'absolute', top: 10, left: 10, zIndex: 1,
                      width: 24, height: 24, borderRadius: '50%',
                      background: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : '#CD7F32',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 900, color: 'white',
                    }}>
                      {i + 1}
                    </div>
                  )}
                  <RestaurantCard restaurant={r} onClick={() => navigate(`/restaurant/${r._id}`)} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--clr-text-muted)' }}>No trending data yet — check back soon.</p>
          )}
        </Section>

        {/* People like you — only if data exists */}
        {(loadingSimilar || similarUsers.length > 0) && (
          <Section
            eyebrow="Social Discovery"
            title="People Like You Also Love"
            sub="Favourites from diners who share your restaurant history."
          >
            {loadingSimilar ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: 20 }}>
                    <div className="skeleton" style={{ height: 12, width: '28%', borderRadius: 4, marginBottom: 14 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[1, 2, 3].map(j => (
                        <div key={j} className="skeleton" style={{ height: 72, flex: 1, borderRadius: 'var(--r-md)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {similarUsers.map(({ user: simUser, favoriteRestaurants }) => (
                  <div key={simUser._id} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #E8460B, #FFB800)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: 'white',
                      }}>
                        {(simUser.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-dark)' }}>{simUser.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>shares your dining history</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {favoriteRestaurants?.filter(Boolean).map(r => (
                        <Link key={r._id} to={`/restaurant/${r._id}`} style={{
                          flex: '1 1 130px', minWidth: 130, maxWidth: 190,
                          background: 'var(--clr-bg)', borderRadius: 'var(--r-md)',
                          border: '1px solid var(--clr-border)', padding: '10px 12px',
                          textDecoration: 'none', color: 'inherit',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-dark)', marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {r.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>{r.cuisineTypes?.slice(0, 2).join(', ')}</div>
                          {r.rating > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', marginTop: 4 }}>★ {r.rating.toFixed(1)}</div>}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

      </div>
    </div>
  );
}
