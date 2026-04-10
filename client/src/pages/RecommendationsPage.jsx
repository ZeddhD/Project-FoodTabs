import { useState, useEffect } from 'react';
import RecommendationsSection from '../components/RecommendationsSection';
import { useAuthStore } from '../context/store.js';
import { recommendationAPI } from '../services/api.js';

export default function RecommendationsPage() {
  const user = useAuthStore((state) => state.user);
  const [preferences, setPreferences] = useState({
    cuisines: [],
    priceRange: 'moderate',
    ratingMin: 3.5,
    dietary: []
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Halal', 'Kosher'];

  useEffect(() => {
    // Load smart recommendations on mount
    fetchSmartRecommendations();
  }, []);

  const fetchSmartRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationAPI.getSmartRecommendations({
        limit: 10
      });
      setRecommendations(response.data.data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCuisineToggle = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  const handleDietaryToggle = (dietary) => {
    setPreferences(prev => ({
      ...prev,
      dietary: prev.dietary.includes(dietary)
        ? prev.dietary.filter(d => d !== dietary)
        : [...prev.dietary, dietary]
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      const params = {
        cuisinePreference: preferences.cuisines,
        priceRange: preferences.priceRange,
        minRating: preferences.ratingMin
      };
      const response = await recommendationAPI.getByPreferences(params);
      setRecommendations(response.data.data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Preferences Section */}
      <div style={{
        background: '#f9f9f9',
        borderBottom: '2px solid #e0e0e0',
        padding: '24px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: '700'
          }}>
            ⚙️ Personalization Preferences
          </h2>

          {/* Cuisine Preferences */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: '#666'
            }}>
              Favorite Cuisines:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px'
            }}>
              {['Italian', 'Japanese', 'French', 'Indian', 'Chinese', 'Mexican', 'Thai', 'Korean'].map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineToggle(cuisine)}
                  style={{
                    padding: '8px 12px',
                    background: preferences.cuisines.includes(cuisine) ? '#2196F3' : '#fff',
                    color: preferences.cuisines.includes(cuisine) ? 'white' : '#333',
                    border: `1px solid ${preferences.cuisines.includes(cuisine) ? '#2196F3' : '#ddd'}`,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!preferences.cuisines.includes(cuisine)) {
                      e.currentTarget.style.borderColor = '#2196F3';
                      e.currentTarget.style.background = '#E3F2FD';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!preferences.cuisines.includes(cuisine)) {
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: '#666'
            }}>
              Price Range Preference:
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {[
                { value: 'low', label: '💰 Budget-Friendly' },
                { value: 'medium', label: '💵 Moderate' },
                { value: 'high', label: '💸 Premium' },
                { value: 'any', label: '🔄 Any Price' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setPreferences(prev => ({ ...prev, priceRange: option.value }))}
                  style={{
                    padding: '8px 12px',
                    background: preferences.priceRange === option.value ? '#4CAF50' : '#fff',
                    color: preferences.priceRange === option.value ? 'white' : '#333',
                    border: `1px solid ${preferences.priceRange === option.value ? '#4CAF50' : '#ddd'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: '#666'
            }}>
              Dietary Restrictions / Preferences:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px'
            }}>
              {dietaryOptions.map(dietary => (
                <button
                  key={dietary}
                  onClick={() => handleDietaryToggle(dietary)}
                  style={{
                    padding: '8px 12px',
                    background: preferences.dietary.includes(dietary) ? '#FF9800' : '#fff',
                    color: preferences.dietary.includes(dietary) ? 'white' : '#333',
                    border: `1px solid ${preferences.dietary.includes(dietary) ? '#FF9800' : '#ddd'}`,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {dietary}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Threshold */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: '#666'
            }}>
              Minimum Rating: ⭐ {preferences.ratingMin.toFixed(1)}
            </p>
            <input
              type="range"
              min="2"
              max="5"
              step="0.1"
              value={preferences.ratingMin}
              onChange={(e) => setPreferences(prev => ({ ...prev, ratingMin: parseFloat(e.target.value) }))}
              style={{
                width: '200px',
                height: '6px',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSavePreferences}
            style={{
              padding: '10px 20px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            💾 Save Preferences
          </button>
        </div>
      </div>

      {/* Recommendations Section */}
      <RecommendationsSection />

      {/* How it Works Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px',
        background: '#F0F4C3',
        borderRadius: '8px',
        marginTop: '24px'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '700'
        }}>
          ℹ️ How Recommendations Work
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          fontSize: '13px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#333' }}>
              👤 Your Profile
            </p>
            <p style={{ margin: 0 }}>
              We analyze your dining history, favorites, and preferences to understand your taste.
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#333' }}>
              👥 Similar Users
            </p>
            <p style={{ margin: 0 }}>
              We match you with users who have similar preferences and show you what they loved.
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#333' }}>
              📊 Smart Ranking
            </p>
            <p style={{ margin: 0 }}>
              Recommendations are ranked by relevance, rating, and popularity in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}