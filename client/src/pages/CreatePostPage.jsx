import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForumStore } from '../context/store';
import { forumAPI } from '../services/api';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { addPost } = useForumStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const CATEGORIES = ['General', 'Recommendations', 'Complaints', 'Tips & Tricks', 'News & Updates'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag)
      };

      const response = await forumAPI.createPost(submitData);
      addPost(response.data.data);
      alert('Post created successfully!');
      navigate(`/forum/${response.data.data._id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>Create a New Post</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Share your thoughts with the community
      </p>

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

      <form onSubmit={handleSubmit} style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            <option value="">Select a category...</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your post content here... (markdown supported)"
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'Arial',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
            disabled={loading}
          />
          <p style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '4px'
          }}>
            💡 Tip: You can use markdown formatting for better presentation
          </p>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Tags (optional)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas (e.g., pizza, restaurant, review)"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            disabled={loading}
          />
          <p style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '4px'
          }}>
            Tags help others find your post more easily
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '⏳ Creating Post...' : '✓ Create Post'}
        </button>
      </form>
    </div>
  );
}