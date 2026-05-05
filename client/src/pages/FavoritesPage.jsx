import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { favoriteAPI } from '../services/api';
import { RestaurantCard, DishCard, SkeletonRestaurantCard } from '../components/common';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [activeTab, setActiveTab]   = useState('restaurants');

  useEffect(() => { fetchFavorites(); }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteAPI.getAll();
      if (res.data.success) setFavorites(res.data.data || []);
    } catch {
      // silent — empty state handles it
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId) => {
    setRemovingId(favoriteId);
    try {
      await favoriteAPI.remove(favoriteId);
      setFavorites(prev => prev.filter(f => f._id !== favoriteId));
    } catch {
      // ignore
    } finally {
      setRemovingId(null);
    }
  };

  const restaurants = favorites.filter(f => f.type === 'restaurant');
  const dishes      = favorites.filter(f => f.type === 'dish');

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>My Account</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>Saved Favourites</h1>
        </div>
        <div className="grid-restaurants">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRestaurantCard key={i} />)}
        </div>
      </div>
    );
  }

  const hasAny = restaurants.length > 0 || dishes.length > 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          My Account
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>
          Saved Favourites
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>
          Restaurants and dishes you've saved for later.
        </p>
      </div>

      {!hasAny ? (
        <div className="empty-state">
          <div className="empty-state__icon">❤️</div>
          <div className="empty-state__title">No favourites yet</div>
          <div className="empty-state__desc">
            Tap the heart on any restaurant or dish to save it here.
          </div>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--clr-border)' }}>
            {[
              { key: 'restaurants', label: 'Restaurants', count: restaurants.length },
              { key: 'dishes',      label: 'Dishes',      count: dishes.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 16px', background: 'none', border: 'none',
                  fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                  color: activeTab === tab.key ? 'var(--clr-primary)' : 'var(--clr-text-muted)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--clr-primary)' : '2px solid transparent',
                  cursor: 'pointer', marginBottom: -2,
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: activeTab === tab.key ? 'var(--clr-primary)' : 'var(--clr-bg-alt)',
                    color: activeTab === tab.key ? 'white' : 'var(--clr-text-muted)',
                    borderRadius: 20, padding: '1px 7px'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Restaurant grid */}
          {activeTab === 'restaurants' && (
            restaurants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🍽️</div>
                <div className="empty-state__title">No saved restaurants</div>
                <div className="empty-state__desc">Browse and heart any restaurant to save it here.</div>
                <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Restaurants</Link>
              </div>
            ) : (
              <div className="grid-restaurants">
                {restaurants.map(fav => (
                  <div key={fav._id} style={{ position: 'relative' }}>
                    <RestaurantCard
                      restaurant={fav.restaurantId}
                      onClick={() => navigate(`/restaurant/${fav.restaurantId._id}`)}
                    />
                    <button
                      onClick={() => handleRemove(fav._id)}
                      disabled={removingId === fav._id}
                      className="btn btn-danger btn-sm"
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 30, height: 30, padding: 0, borderRadius: '50%',
                        fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      title="Remove from favourites"
                    >
                      {removingId === fav._id ? '…' : '✕'}
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Dish grid */}
          {activeTab === 'dishes' && (
            dishes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🍴</div>
                <div className="empty-state__title">No saved dishes</div>
                <div className="empty-state__desc">Heart any dish on a restaurant page to save it here.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {dishes.map(fav => (
                  <div key={fav._id} style={{ position: 'relative' }}>
                    <DishCard
                      dish={fav.dishId}
                      onClick={() => navigate(`/dish/${fav.dishId._id}`)}
                    />
                    <button
                      onClick={() => handleRemove(fav._id)}
                      disabled={removingId === fav._id}
                      className="btn btn-danger btn-sm"
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 28, height: 28, padding: 0, borderRadius: '50%',
                        fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      title="Remove from favourites"
                    >
                      {removingId === fav._id ? '…' : '✕'}
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
