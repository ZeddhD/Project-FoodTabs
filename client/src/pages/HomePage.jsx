import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import { RestaurantCard, SearchBar } from '../components/common';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, [filters, search]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        cuisine: filters.cuisine || undefined,
        city: filters.city || undefined,
        minRating: filters.rating || undefined,
        page: 1,
        limit: 12
      };

      const response = await restaurantAPI.getAll(params);
      if (response.data.success) {
        setRestaurants(response.data.data.restaurants);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>🍽️ Discover Restaurants</h1>
      
      <SearchBar 
        onSearch={setSearch}
        onFilter={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
      />

      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '16px' }}>Loading restaurants...</p>
      ) : restaurants.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>
          No restaurants found. Try different filters.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {restaurants.map(restaurant => (
            <RestaurantCard 
              key={restaurant._id}
              restaurant={restaurant}
              onClick={() => navigate(`/restaurant/${restaurant._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
