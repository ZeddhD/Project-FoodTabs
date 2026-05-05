import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/store.js';
import { userAPI } from '../services/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
    if (user?.role === 'admin') {
      userAPI.getAdminStats()
        .then(res => setStats(res.data.data))
        .catch(err => setError(err.response?.data?.message || 'Failed to load stats'))
        .finally(() => setLoading(false));
    } else if (user && user.role !== 'admin') {
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '60px auto', padding: '0 24px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ maxWidth: 1100, margin: '60px auto', padding: '0 24px' }}>
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '16px 20px', borderRadius: 'var(--r-lg)', fontSize: 14 }}>
          Failed to load dashboard stats: {error || 'Unknown error'}. Make sure the server is running.
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: '#2563EB', sub: `${stats.customers} customers · ${stats.owners} owners`, to: '/admin/users' },
    { label: 'Active Restaurants', value: stats.totalRestaurants, color: '#E8460B', sub: `${stats.verifiedRestaurants} verified`, to: '/admin/verification' },
    { label: 'Total Bookings', value: stats.totalBookings, color: '#7C3AED', sub: null },
    { label: 'Total Reviews', value: stats.totalReviews, color: '#059669', sub: `Avg ★ ${stats.averageRating}/5` },
    { label: 'Pending Reports', value: stats.pendingReports, color: '#DC2626', sub: 'Need action', to: '/admin/reports', alert: stats.pendingReports > 0 },
    { label: 'Pending Verifications', value: stats.pendingVerifications, color: '#D97706', sub: 'Awaiting review', to: '/admin/verification', alert: stats.pendingVerifications > 0 },
  ];

  return (
    <div style={{ background: 'var(--clr-bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--clr-border)', padding: '24px var(--px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Admin</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, margin: 0 }}>Platform Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>Live stats and management tools for FoodTabs.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px var(--px) 60px' }}>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {statCards.map(card => (
            <div
              key={card.label}
              onClick={card.to ? () => navigate(card.to) : undefined}
              style={{
                background: 'white', borderRadius: 'var(--r-lg)',
                border: `1px solid ${card.alert ? card.color + '60' : 'var(--clr-border)'}`,
                padding: '20px', cursor: card.to ? 'pointer' : 'default',
                transition: 'box-shadow 0.15s',
                boxShadow: card.alert ? `0 0 0 3px ${card.color}18` : 'none',
              }}
              onMouseEnter={e => { if (card.to) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { if (card.to) e.currentTarget.style.boxShadow = card.alert ? `0 0 0 3px ${card.color}18` : 'none'; }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
              {card.sub && <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', marginTop: 6 }}>{card.sub}</div>}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '24px', marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, margin: '0 0 16px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Manage Reports', to: '/admin/reports', color: '#DC2626', badge: stats.pendingReports },
              { label: 'Verify Restaurants', to: '/admin/verification', color: '#059669', badge: stats.pendingVerifications },
              { label: 'Manage Users', to: '/admin/users', color: '#2563EB' },
            ].map(btn => (
              <Link
                key={btn.label}
                to={btn.to}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: btn.color, color: 'white',
                  borderRadius: 'var(--r-md)', textDecoration: 'none',
                  fontWeight: 700, fontSize: 13,
                }}
              >
                {btn.label}
                {btn.badge > 0 && (
                  <span style={{
                    background: 'white', color: btn.color,
                    borderRadius: '50%', width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, flexShrink: 0,
                  }}>{btn.badge}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Platform overview */}
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, margin: '0 0 16px' }}>Platform Overview</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Active Restaurants', value: `${stats.verifiedRestaurants} verified, ${stats.totalRestaurants - stats.verifiedRestaurants} unverified`, border: '#E8460B' },
              { label: 'User Distribution', value: `${stats.customers} customers · ${stats.owners} restaurant owners · ${stats.admins} admins`, border: '#2563EB' },
              { label: 'Content', value: `${stats.totalReviews} reviews · ${stats.totalBookings} bookings`, border: '#059669' },
              { label: 'Average Platform Rating', value: `${stats.averageRating}/5 based on ${stats.totalReviews} reviews`, border: '#F59E0B' },
            ].map(row => (
              <div key={row.label} style={{ padding: '12px 14px', background: 'var(--clr-bg)', borderRadius: 'var(--r-sm)', borderLeft: `3px solid ${row.border}`, fontSize: 13 }}>
                <strong>{row.label}:</strong> <span style={{ color: 'var(--clr-text-muted)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
