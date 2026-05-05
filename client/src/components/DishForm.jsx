import { useState } from 'react';
import { dishAPI } from '../services/api';

export default function DishForm({ restaurantId, dish = null, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: dish?.name || '',
    description: dish?.description || '',
    price: dish?.price || '',
    category: dish?.category || '',
    image: dish?.image || '',
    isAvailable: dish?.isAvailable !== false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const CATEGORIES = ['Appetizers', 'Mains', 'Sides', 'Desserts', 'Beverages', 'Soups', 'Salads'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim() || !formData.price) {
      setError('Name and price are required');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (dish?._id) {
        // Update existing dish
        response = await dishAPI.update(dish._id, formData);
      } else {
        // Create new dish
        response = await dishAPI.create(restaurantId, formData);
      }

      alert(`Dish ${dish?._id ? 'updated' : 'created'} successfully!`);
      onSuccess?.(response.data.data);
    } catch (err) {
      console.error('Error saving dish:', err);
      setError(err.response?.data?.message || 'Failed to save dish. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'white',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
        {dish ? 'Edit Dish' : 'Add New Dish'}
      </h3>

      {error && (
        <div style={{
          padding: '12px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Dish Name */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          fontSize: '13px'
        }}>
          Dish Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Margherita Pizza"
          required
          disabled={loading}
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

      {/* Description */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          fontSize: '13px'
        }}>
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your dish..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'Arial',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
          disabled={loading}
        />
      </div>

      {/* Category */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          fontSize: '13px'
        }}>
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          fontSize: '13px'
        }}>
          Price ($) *
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="19.99"
          step="0.01"
          min="0"
          required
          disabled={loading}
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

      {/* Image URL */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          fontSize: '13px'
        }}>
          Image URL
        </label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          disabled={loading}
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

      {/* Available */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          name="isAvailable"
          checked={formData.isAvailable}
          onChange={handleChange}
          disabled={loading}
          style={{
            width: '18px',
            height: '18px',
            cursor: 'pointer'
          }}
          id="available-checkbox"
        />
        <label
          htmlFor="available-checkbox"
          style={{
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Available for order
        </label>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            background: loading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Saving...' : `✓ ${dish ? 'Update' : 'Add'} Dish`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            background: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}