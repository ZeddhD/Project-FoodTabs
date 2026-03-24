import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../context/store';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'customer'
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuthStore();
  const navigate   = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        login(res.data.data, res.data.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Visual */}
      <div className="auth-visual">
        <div className="auth-visual__content">
          <span className="auth-visual__emoji">🌟</span>
          <h2 className="auth-visual__title">Join the Food<br />Community</h2>
          <p className="auth-visual__desc">
            Discover great restaurants, share reviews, book tables, and connect with fellow food lovers.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', maxWidth: 300 }}>
            {[
              ['🔍', 'Discover restaurants & dishes'],
              ['⭐', 'Write detailed multi-criteria reviews'],
              ['📅', 'Book tables & special events'],
              ['❤️', 'Save your favourite places'],
              ['💬', 'Join the food community forum'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 14, opacity: 0.85 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ fontSize: 13, color: 'var(--clr-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
              ← Back to home
            </Link>
            <h1 className="auth-form-title">Create Account</h1>
            <p className="auth-form-sub">Already have one? <Link to="/login" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Sign in →</Link></p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone <span style={{ color: 'var(--clr-text-light)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+1 555 000 0000"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'customer', label: '🍴 Food Lover', desc: 'Discover & review' },
                  { value: 'owner',   label: '🏪 Restaurant Owner', desc: 'Manage your venue' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      padding: '12px 14px',
                      border: `2px solid ${formData.role === opt.value ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                      borderRadius: 'var(--r-sm)',
                      cursor: 'pointer',
                      background: formData.role === opt.value ? 'var(--clr-primary-light)' : 'white',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={formData.role === opt.value}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{opt.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 24 }}>
            By creating an account you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
