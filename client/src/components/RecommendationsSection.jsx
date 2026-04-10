import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationAPI } from '../services/api.js';

export default function RecommendationsSection() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [similarUsers, setSimilarUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationAPI.getSmartRecommendations({ limit: 6 });
      setRecommendations(response.data.data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const RestaurantCard = ({ restaurant, reason }) => (
    <div
      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
      style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {/* Image */}
      <div
        style={{
          width: '100%',
          height: '120px',
          background: '#f0f0f0',
          overflow: 'hidden'
        }}
      >
        <img
          src={restaurant.image}
          alt={restaurant.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{
          margin: '0 0 4px 0',
          fontSize: '14px',
          fontWeight: '700',
          color: '#333'
        }}>
          {restaurant.name}
        </p>

        <p style={{
          margin: '0 0 6px 0',
          fontSize: '12px',
          color: '#999'
        }}>
          {restaurant.cuisine}
        </p>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '6px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#FF9800' }}>
            ⭐ {restaurant.rating}
          </span>
          <span style={{ fontSize: '12px', color: '#999' }}>
            ({restaurant.reviews})
          </span>
        </div>

        {/* Reason tag */}
        <p style={{
          margin: '6px 0 0 0',
          fontSize: '11px',
          background: '#E3F2FD',
          color: '#2196F3',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block',
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          💡 {reason}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          🎯 Recommended For You
        </h2>
        <p style={{
          margin: 0,
          color: '#666',
          fontSize: '14px'
        }}>
          Personalized recommendations based on your preferences and dining history
        </p>
      </div>

      {/* Recommendations Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {recommendations.map((restaurant, idx) => (
          <RestaurantCard
            key={restaurant._id}
            restaurant={restaurant}
            reason={restaurant.reason}
          />
        ))}
      </div>

      {/* Similar Users Section */}
      <div style={{
        background: '#E3F2FD',
        borderRadius: '8px',
        padding: '20px',
        border: '2px solid #2196F3'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '700',
          color: '#2196F3'
        }}>
          👥 People Like You Also Enjoyed
        </h3>

        <p style={{
          margin: '0 0 16px 0',
          fontSize: '13px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          Connect with food lovers who share your taste preferences. Here are restaurants that similar users have highly rated:
        </p>

        {/* Similar Restaurants */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {recommendations.slice(1, 3).map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              reason={restaurant.reason}
            />
          ))}
        </div>

        <p style={{
          margin: '16px 0 0 0',
          fontSize: '12px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          💬 Did you find this helpful? Your feedback helps us improve recommendations!
        </p>
      </div>

      {/* Suggestion Box */}
      <div style={{
        marginTop: '24px',
        background: '#F0F4C3',
        borderLeft: '4px solid #FFC107',
        padding: '16px',
        borderRadius: '4px'
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#666'
        }}>
          <strong>💡 Tip:</strong> Save your favorite restaurants to get even more personalized recommendations. Check your{' '}
          <span
            onClick={() => navigate('/favorites')}
            style={{
              color: '#2196F3',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '600'
            }}
          >
            Favorites
          </span>
          {' '}page to see all your saved restaurants.
        </p>
      </div>
    </div>
  );
}