import { useState } from 'react';
import { authAPI } from '../services/api';

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

export default function UserProfileForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name:      user?.name    || '',
    phone:     user?.phone   || '',
    address:   user?.address || '',
    bio:       user?.bio     || '',
    cuisines:  (user?.preferences?.cuisines || []).join(', '),
    priceRange: user?.preferences?.priceRange || ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Name is required'); return; }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name:    formData.name.trim(),
        phone:   formData.phone.trim(),
        address: formData.address.trim(),
        bio:     formData.bio.trim(),
        preferences: {
          cuisines:   formData.cuisines.split(',').map(c => c.trim()).filter(Boolean),
          priceRange: formData.priceRange || undefined
        }
      };
      const response = await authAPI.updateProfile(payload);
      setSuccess(true);
      setTimeout(() => onSave?.(response.data.data), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: 28, border: '1px solid var(--clr-border)', maxWidth: 520, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'var(--clr-dark)' }}>Edit Profile</h2>

      {error && (
        <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: 'var(--r-sm)', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#ECFDF5', color: '#059669', padding: '10px 14px', borderRadius: 'var(--r-sm)', marginBottom: 16, fontSize: 13 }}>
          Profile updated successfully!
        </div>
      )}

      {field('Name *', 'name', 'text', 'Your full name')}
      {field('Phone', 'phone', 'tel', '+880 1XXX XXXXXX')}
      {field('Address', 'address', 'text', 'City, Area')}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself..."
          rows={3}
          className="form-input"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--clr-text-muted)', marginBottom: 12 }}>
          Food Preferences
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>
            Favourite Cuisines
            <span style={{ fontWeight: 400, color: 'var(--clr-text-muted)', marginLeft: 6 }}>(comma-separated)</span>
          </label>
          <input
            type="text"
            name="cuisines"
            value={formData.cuisines}
            onChange={handleChange}
            placeholder="e.g. Bengali, Thai, Italian"
            className="form-input"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>Price Range</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PRICE_RANGES.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priceRange: prev.priceRange === p ? '' : p }))}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: formData.priceRange === p ? 'none' : '1px solid var(--clr-border)',
                  background: formData.priceRange === p ? 'var(--clr-primary)' : 'white',
                  color: formData.priceRange === p ? 'white' : 'var(--clr-text)'
                }}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} disabled={loading} className="btn btn-ghost" style={{ flex: 1 }}>
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
