import { useState, useEffect } from 'react';
import { restaurantAPI, reviewAPI } from '../services/api';
import ReviewResponseForm from '../components/ReviewResponseForm';

export default function OwnerReviewsPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch owner's restaurant
      const restaurantResponse = await restaurantAPI.getOwnerRestaurants();
      if (restaurantResponse.data.data && restaurantResponse.data.data.length > 0) {
        const rest = restaurantResponse.data.data[0];
        setRestaurant(rest);

        // Fetch reviews for this restaurant
        const reviewsResponse = await reviewAPI.getAll({
          restaurantId: rest._id,
          limit: 100
        });
        setReviews(reviewsResponse.data.data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        ⏳ Loading reviews...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ color: '#666' }}>No restaurant found.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0' }}>Reviews Management</h1>
        <p style={{ margin: 0, color: '#666' }}>
          {restaurant.name} • {reviews.length} reviews
        </p>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Reviews List */}
      {reviews && reviews.length > 0 ? (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                padding: '16px'
              }}
            >
              {/* Review Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '12px'
              }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '15px' }}>
                    {review.author?.name || 'Anonymous'}
                  </p>
                  <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                    {renderStars(review.rating)}
                  </p>
                  <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                    {review.rating}/5
                  </p>
                </div>
              </div>

              {/* Multi-criteria Ratings */}
              {review.ratings && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: '4px'
                }}>
                  {Object.entries(review.ratings).map(([category, rating]) => (
                    <div key={category}>
                      <p style={{
                        margin: '0 0 4px 0',
                        color: '#666',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {category}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2196F3'
                      }}>
                        {rating}⭐
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Content */}
              <p style={{
                margin: '0 0 12px 0',
                lineHeight: '1.6',
                color: '#333',
                fontSize: '14px'
              }}>
                {review.content}
              </p>

              {/* Divider */}
              <hr style={{
                margin: '12px 0',
                border: 'none',
                borderTop: '1px solid #e0e0e0'
              }} />

              {/* Owner Response */}
              {review.ownerResponse ? (
                <div style={{
                  background: '#E3F2FD',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  borderLeft: '4px solid #2196F3'
                }}>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: '#1976D2'
                  }}>
                    Your Response
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#333',
                    lineHeight: '1.5'
                  }}>
                    {review.ownerResponse}
                  </p>
                </div>
              ) : (
                <div style={{
                  background: '#FFF3E0',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  borderLeft: '4px solid #FF9800'
                }}>
                  <p style={{
                    margin: 0,
                    fontWeight: '600',
                    fontSize: '12px',
                    color: '#F57C00'
                  }}>
                    📝 No response yet
                  </p>
                </div>
              )}

              {/* Response Form Toggle */}
              {respondingTo === review._id ? (
                <ReviewResponseForm
                  review={review}
                  onSuccess={() => {
                    setRespondingTo(null);
                    fetchData();
                  }}
                  onCancel={() => setRespondingTo(null)}
                />
              ) : (
                <button
                  onClick={() => setRespondingTo(review._id)}
                  style={{
                    padding: '8px 16px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {review.ownerResponse ? '✏️ Edit Response' : '💬 Add Response'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '32px',
          background: '#f5f5f5',
          borderRadius: '8px',
          color: '#999'
        }}>
          <p>No reviews yet. When customers review your restaurant, you can respond here!</p>
        </div>
      )}
    </div>
  );
}