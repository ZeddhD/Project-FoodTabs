import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import PhotoUploadHelper from '../components/PhotoUploadHelper';

export default function ReviewCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const dishId = searchParams.get('dishId');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
    ratings: {
      taste: 5,
      hygiene: 5,
      service: 5,
      ambience: 5,
      value: 5
    }
  });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: parseInt(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create FormData to handle file uploads
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('rating', formData.rating);
      submitData.append('ratings', JSON.stringify(formData.ratings));
      submitData.append('restaurantId', restaurantId || '');
      submitData.append('dishId', dishId || '');

      // Add photos
      photos.forEach((photo, index) => {
        submitData.append(`photos`, photo);
      });

      const response = await reviewAPI.create(submitData);
      if (response.data.success) {
        alert('Review submitted successfully!');
        navigate(restaurantId ? `/restaurant/${restaurantId}` : '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>✍️ Write a Review</h1>

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Title
          </label>
          <input 
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Review
          </label>
          <textarea 
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required
            rows="5"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Overall Rating: {formData.rating}/5
          </label>
          <input 
            type="range"
            min="1"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>
            Rate by Category (1-5)
          </h3>
          
          {['taste', 'hygiene', 'service', 'ambience', 'value'].map(category => (
            <div key={category} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ textTransform: 'capitalize', fontWeight: '500', fontSize: '13px' }}>
                {category}:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="range"
                  min="1"
                  max="5"
                  value={formData.ratings[category]}
                  onChange={(e) => handleRatingChange(category, e.target.value)}
                  style={{ width: '150px' }}
                />
                <span style={{ fontWeight: '500', minWidth: '20px' }}>
                  {formData.ratings[category]}/5
                </span>
              </div>
            </div>
          ))}
        </div>

        <PhotoUploadHelper
          onPhotosSelected={(selectedPhotos, previews) => {
            setPhotos(selectedPhotos);
            setPhotoPreviews(previews);
          }}
          maxPhotos={5}
        />

        <button 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
