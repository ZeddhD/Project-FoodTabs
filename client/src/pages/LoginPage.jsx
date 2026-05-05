import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../context/store';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }   = useAuthStore();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        const userData = res.data.data;
        login(userData, userData.token);
        if (userData.role === 'admin') navigate('/admin/dashboard');
        else if (userData.role === 'owner') navigate('/owner/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Visual panel */}
      <div className="auth-visual">
        <div className="auth-visual__content">
          <span className="auth-visual__emoji">🍽️</span>
          <h2 className="auth-visual__title">Welcome Back,<br />Food Lover!</h2>
          <p className="auth-visual__desc">
            Sign in to discover top-rated restaurants, read reviews, and book your next great meal.
          </p>
          <div style={{ marginTop: 40, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🍕 Reviews', '📅 Bookings', '❤️ Favourites', '🤖 AI Chat'].map(f => (
              <div key={f} style={{ fontSize: 13, fontWeight: 600, opacity: 0.75 }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ fontSize: 13, color: 'var(--clr-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
              ← Back to home
            </Link>
            <h1 className="auth-form-title">Sign In</h1>
            <p className="auth-form-sub">Don't have an account? <Link to="/register" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Create one free →</Link></p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 24 }}>
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
