import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { restaurantAPI, reviewAPI, favoriteAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { DishCard, ReviewCard } from '../components/common';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    setLoading(true);
    try {
      const response = await restaurantAPI.getById(id);
      if (response.data.success) {
        const { restaurant: data, dishes: dishList, recentReviews } = response.data.data;
        setRestaurant(data);
        setDishes(dishList);
        setReviews(recentReviews);

        // Check if favorited
        if (isAuthenticated) {
          const favCheck = await favoriteAPI.check({
            restaurantId: id,
            type: 'restaurant'
          });
          setIsFavorited(favCheck.data.data.isFavorited);
        }
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        const favCheck = await favoriteAPI.check({
          restaurantId: id,
          type: 'restaurant'
        });
        await favoriteAPI.remove(favCheck.data.data.favoriteId);
      } else {
        // Add to favorites
        await favoriteAPI.add({
          restaurantId: id,
          type: 'restaurant'
        });
      }
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  if (loading) return <p style={{ padding: '24px', textAlign: 'center' }}>Loading...</p>;
  if (!restaurant) return <p style={{ padding: '24px', textAlign: 'center' }}>Restaurant not found</p>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Restaurant Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: '28px' }}>{restaurant.name}</h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
              <span>⭐ {restaurant.rating?.toFixed(1)}/5 ({restaurant.reviewsCount} reviews)</span>
              <span>{restaurant.priceRange}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link 
              to={`/restaurant/${id}/book`}
              style={{
                padding: '10px 16px',
                background: '#2196F3',
                color: 'white',
                textDecoration: 'none',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              📅 Book Table
            </Link>
            <button 
              onClick={handleAddFavorite}
              style={{
                padding: '10px 16px',
                background: isFavorited ? '#FF5722' : '#f0f0f0',
                color: isFavorited ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {isFavorited ? '❤️ Favorited' : '🤍 Favorite'}
            </button>
          </div>
        </div>

        <img 
          src={restaurant.coverImage || '/default-restaurant.jpg'}
          alt={restaurant.name}
          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
        />

        <div style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>
          <p><strong>📍 Address:</strong> {restaurant.address}</p>
          <p><strong>📞 Phone:</strong> {restaurant.phone}</p>
          <p><strong>🍴 Cuisine:</strong> {restaurant.cuisineTypes?.join(', ')}</p>
          {restaurant.website && <p><strong>🌐 Website:</strong> {restaurant.website}</p>}
        </div>
      </div>

      {/* Dishes Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>🍽️ Dishes</h2>
          {isAuthenticated && (
            <button 
              onClick={() => navigate(`/review/create?restaurantId=${id}`)}
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Add Review
            </button>
          )}
        </div>

        {dishes.length === 0 ? (
          <p style={{ color: '#666' }}>No dishes available</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {dishes.map(dish => (
              <DishCard 
                key={dish._id}
                dish={dish}
                onClick={() => navigate(`/dish/${dish._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>⭐ Recent Reviews</h2>
        
        {reviews.length === 0 ? (
          <p style={{ color: '#666' }}>No reviews yet. Be the first to review!</p>
        ) : (
          <div>
            {reviews.map(review => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
