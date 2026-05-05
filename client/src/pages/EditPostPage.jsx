import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { forumAPI } from '../services/api';
import { useAuthStore } from '../context/store';

const CATEGORIES = [
  'Best in City',
  'Hidden Gems',
  'Bad Experiences',
  'Ask the Community',
  'Deals and Offers',
  'Neighbourhood Eats',
];

export default function EditPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({ title: '', content: '', category: '', tags: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => { fetchPost(); }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await forumAPI.getPost(postId);
      const post = res.data.data;

      const ownerId = post.userId?._id || post.userId;
      if (ownerId && ownerId.toString() !== (user?._id || user?.id)?.toString() && user?.role !== 'admin') {
        setError('You can only edit your own posts.');
        return;
      }

      setFormData({
        title:    post.title    || '',
        content:  post.content  || '',
        category: post.category || '',
        tags:     (post.tags || []).join(', '),
      });
    } catch {
      setError('Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim())   { setError('Title is required.');   return; }
    if (!formData.content.trim()) { setError('Content is required.'); return; }

    setSaving(true);
    setError(null);
    try {
      await forumAPI.updatePost(postId, {
        title:    formData.title.trim(),
        content:  formData.content.trim(),
        category: formData.category,
        tags:     formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      navigate(`/forum/${postId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 760, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div style={{ maxWidth: 760, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ padding: '14px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
        <Link to="/forum" style={{ color: 'var(--clr-primary)', fontWeight: 600, fontSize: 14 }}>← Back to Forum</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>

      <Link to={`/forum/${postId}`} style={{ color: 'var(--clr-primary)', fontSize: 13, fontWeight: 600, display: 'inline-block', marginBottom: 20 }}>
        ← Back to Post
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Community Forum
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>Edit Post</h1>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>
            Title <span style={{ color: 'var(--clr-primary)' }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            disabled={saving}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="filter-select"
            style={{ width: '100%', padding: '10px 12px' }}
            disabled={saving}
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
            disabled={saving}
          />
          <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>
            {formData.content.length}/3000 characters
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>
            Tags <span style={{ fontWeight: 400, color: 'var(--clr-text-muted)', marginLeft: 4 }}>(comma-separated)</span>
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. biryani, dhaka, budget-eats"
            disabled={saving}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate(`/forum/${postId}`)} disabled={saving} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
