import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store.js';
import { userAPI } from '../services/api.js';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore(s => s.user);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') navigate('/');
    if (currentUser?.role === 'admin') fetchUsers();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAllUsers({ limit: 200 });
      const raw = res.data.data;
      setUsers(Array.isArray(raw) ? raw : raw?.users || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId) => {
    const reason = window.prompt('Reason for banning this user:');
    if (!reason?.trim()) return;
    setActionLoading(userId);
    try {
      await userAPI.banUser(userId, { reason });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: true, banReason: reason } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to ban user');
    } finally { setActionLoading(null); }
  };

  const handleUnban = async (userId) => {
    setActionLoading(userId);
    try {
      await userAPI.unbanUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: false, banReason: null } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unban user');
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    setActionLoading(userId);
    try {
      await userAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally { setActionLoading(null); }
  };

  // Client-side filter + sort
  const filtered = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    })
    .sort((a, b) => sortBy === 'newest'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt));

  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    owners: users.filter(u => u.role === 'owner').length,
    admins: users.filter(u => u.role === 'admin').length,
    banned: users.filter(u => u.isBanned).length,
  };

  const roleColor = r => ({ admin: '#7C3AED', owner: '#D97706', customer: '#2563EB' }[r] || '#666');

  if (loading) return (
    <div style={{ maxWidth: 1100, margin: '60px auto', padding: '0 24px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ background: 'var(--clr-bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--clr-border)', padding: '24px var(--px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Admin</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, margin: 0 }}>User Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>Manage accounts, roles, and access.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px var(--px) 60px' }}>

        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13 }}>{error}</div>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: stats.total, color: '#2563EB' },
            { label: 'Customers', value: stats.customers, color: '#2563EB' },
            { label: 'Owners', value: stats.owners, color: '#D97706' },
            { label: 'Admins', value: stats.admins, color: '#7C3AED' },
            { label: 'Banned', value: stats.banned, color: '#DC2626' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: '1 1 200px', minWidth: 180 }}
          />
          <select className="form-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 140 }}>
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
          </select>
          <select className="form-input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 140 }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state__icon">👥</div>
              <div className="empty-state__title">No users found</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--clr-bg)', borderBottom: '2px solid var(--clr-border)' }}>
                    {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontWeight: 700, fontSize: 11, textAlign: h === 'Actions' ? 'center' : 'left', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--clr-border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #E8460B, #FFB800)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800, color: 'white',
                          }}>
                            {(u.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--clr-dark)' }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: roleColor(u.role) + '18', color: roleColor(u.role), textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.isBanned ? '#FEE2E2' : '#DCFCE7', color: u.isBanned ? '#DC2626' : '#16A34A' }}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--clr-text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {u._id === (currentUser?._id || currentUser?.userId) ? (
                          <span style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>You</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            {u.isBanned ? (
                              <button
                                onClick={() => handleUnban(u._id)}
                                disabled={actionLoading === u._id}
                                className="btn btn-sm"
                                style={{ background: '#059669', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                              >
                                {actionLoading === u._id ? '…' : 'Unban'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBan(u._id)}
                                disabled={actionLoading === u._id}
                                style={{ background: '#D97706', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                              >
                                {actionLoading === u._id ? '…' : 'Ban'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(u._id)}
                              disabled={actionLoading === u._id}
                              style={{ background: '#DC2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {stats.banned > 0 && (
          <div style={{ marginTop: 20, background: '#FEF2F2', borderLeft: '3px solid #DC2626', padding: '12px 16px', borderRadius: 'var(--r-sm)', fontSize: 13, color: '#DC2626' }}>
            <strong>{stats.banned} banned user{stats.banned !== 1 ? 's' : ''}</strong> — their access is currently restricted.
          </div>
        )}
      </div>
    </div>
  );
}
