import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoriteAPI } from '../services/api';
import { RestaurantCard, DishCard } from '../components/common';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoriteAPI.getAll();
      if (response.data.success) {
        setFavorites(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId) => {
    try {
      await favoriteAPI.remove(favoriteId);
      setFavorites(favorites.filter(f => f._id !== favoriteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const restaurants = favorites.filter(f => f.type === 'restaurant');
  const dishes = favorites.filter(f => f.type === 'dish');

  if (loading) return <p style={{ padding: '24px', textAlign: 'center' }}>Loading favorites...</p>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>❤️ My Favorites</h1>

      {/* Favorite Restaurants */}
      {restaurants.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>🍽️ Favorite Restaurants</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {restaurants.map(fav => (
              <div key={fav._id} style={{ position: 'relative' }}>
                <RestaurantCard 
                  restaurant={fav.restaurantId}
                  onClick={() => navigate(`/restaurant/${fav.restaurantId._id}`)}
                />
                <button 
                  onClick={() => handleRemove(fav._id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '6px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Dishes */}
      {dishes.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>🍴 Favorite Dishes</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {dishes.map(fav => (
              <div key={fav._id} style={{ position: 'relative', paddingRight: '50px' }}>
                <DishCard 
                  dish={fav.dishId}
                  onClick={() => navigate(`/dish/${fav.dishId._id}`)}
                />
                <button 
                  onClick={() => handleRemove(fav._id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '6px 12px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {restaurants.length === 0 && dishes.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
          No favorites yet. Start adding some!
        </p>
      )}
    </div>
  );
}
