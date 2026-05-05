import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForumStore } from '../context/store';
import { forumAPI } from '../services/api';

const CATEGORIES = [
  'Best in City',
  'Hidden Gems',
  'Bad Experiences',
  'Ask the Community',
  'Deals and Offers',
  'Neighbourhood Eats',
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { addPost } = useForumStore();
  const [formData, setFormData] = useState({ title: '', content: '', category: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim())   { setError('Title is required.');    return; }
    if (!formData.content.trim()) { setError('Content is required.');  return; }
    if (!formData.category)       { setError('Please select a category.'); return; }

    try {
      setLoading(true);
      setError(null);
      const res = await forumAPI.createPost({
        title:    formData.title.trim(),
        content:  formData.content.trim(),
        category: formData.category,
        tags:     formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      addPost(res.data.data);
      navigate(`/forum/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, required = false, hint = null) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>
        {label}{required && <span style={{ color: 'var(--clr-primary)', marginLeft: 2 }}> *</span>}
      </label>
      <input
        type="text"
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="form-input"
        disabled={loading}
        placeholder={hint || ''}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>

      <Link to="/forum" style={{ color: 'var(--clr-primary)', fontSize: 13, fontWeight: 600, display: 'inline-block', marginBottom: 20 }}>
        ← Back to Forum
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Community Forum
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>Create a Post</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>Share a tip, experience, or question with the community.</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>

        {field('Title', 'title', true, 'e.g. Best biryani in Dhaka?')}

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>
            Category <span style={{ color: 'var(--clr-primary)' }}>*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="filter-select"
            style={{ width: '100%', padding: '10px 12px' }}
            disabled={loading}
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>
            Content <span style={{ color: 'var(--clr-primary)' }}>*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="form-input"
            rows={8}
            style={{ resize: 'vertical' }}
            placeholder="Write your post here…"
            disabled={loading}
          />
          <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>
            {formData.content.length}/3000 characters
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>
            Tags <span style={{ fontWeight: 400, color: 'var(--clr-text-muted)', marginLeft: 4 }}>(optional, comma-separated)</span>
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. biryani, dhaka, budget-eats"
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/forum')} disabled={loading} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Posting…' : 'Post to Community'}
          </button>
        </div>
      </form>
    </div>
  );
}
