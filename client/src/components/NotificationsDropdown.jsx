import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useAuthStore } from '../context/store';

const TYPE_META = {
  new_review:            { icon: '⭐', color: 'var(--clr-accent)',      defaultLink: '/owner/reviews' },
  new_booking:           { icon: '📅', color: 'var(--clr-info)',         defaultLink: '/owner/bookings' },
  booking_update:        { icon: '📋', color: 'var(--clr-success)',      defaultLink: '/bookings' },
  review_response:       { icon: '💬', color: 'var(--clr-primary)',      defaultLink: null },
  verification:          { icon: '🏪', color: '#059669',                  defaultLink: '/admin/verification' },
  vendor_application:    { icon: '🏪', color: '#059669',                  defaultLink: '/admin/verification' },
  verification_approved: { icon: '✅', color: '#059669',                  defaultLink: '/owner/dashboard' },
  verification_rejected: { icon: '❌', color: '#DC2626',                  defaultLink: '/owner/dashboard' },
  report:                { icon: '🚨', color: '#DC2626',                  defaultLink: '/admin/reports' },
  moderation:            { icon: '🚨', color: '#DC2626',                  defaultLink: '/admin/reports' },
  default:               { icon: '🔔', color: 'var(--clr-text-muted)',   defaultLink: null },
};

function meta(type) { return TYPE_META[type] || TYPE_META.default; }

const formatTime = (date) => {
  const diff = Date.now() - new Date(date);
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export default function NotificationsDropdown() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]         = useState(false);

  const unread = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
      notificationAPI.markRead(n._id).catch(() => {});
    }
    const destination = n.link || meta(n.type).defaultLink;
    if (destination) {
      setIsOpen(false);
      navigate(destination);
    }
  };

  const handleMarkAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    notificationAPI.markAllRead().catch(() => {});
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n._id !== id));
    notificationAPI.delete(id).catch(() => {});
  };

  const handleClearAll = async () => {
    setNotifications([]);
    notificationAPI.clearAll().catch(() => {});
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setIsOpen(o => !o); if (!isOpen) fetchNotifications(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4, lineHeight: 1, fontSize: 20, color: 'var(--clr-text-muted)' }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: -2,
            background: 'var(--clr-primary)', color: 'white',
            borderRadius: 'var(--r-full)', minWidth: 17, height: 17,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 198 }}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            background: 'white', borderRadius: 'var(--r-lg)',
            border: '1px solid var(--clr-border)',
            boxShadow: 'var(--shadow-lg)',
            width: 340, maxWidth: '90vw',
            display: 'flex', flexDirection: 'column',
            zIndex: 199, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid var(--clr-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--clr-bg-2)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>
                Notifications {unread > 0 && <span style={{ color: 'var(--clr-primary)' }}>({unread})</span>}
              </span>
              {unread > 0 && (
                <button onClick={handleMarkAll} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: 'var(--clr-primary)', cursor: 'pointer' }}>
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: 13 }}>
                  Loading…
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                  <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>No notifications yet</div>
                </div>
              ) : (
                notifications.map(n => {
                  const { icon, color } = meta(n.type);
                  return (
                    <div
                      key={n._id}
                      onClick={() => handleClick(n)}
                      style={{
                        display: 'flex', gap: 12, padding: '12px 16px',
                        borderBottom: '1px solid var(--clr-border)',
                        background: n.isRead ? 'white' : 'var(--clr-primary-light)',
                        cursor: (n.link || meta(n.type).defaultLink) ? 'pointer' : 'default',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (n.link || meta(n.type).defaultLink) e.currentTarget.style.background = n.isRead ? 'var(--clr-bg-2)' : '#FFDDD5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'white' : 'var(--clr-primary-light)'; }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 'var(--r-sm)', flexShrink: 0,
                        background: color + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                      }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: 'var(--clr-text)', marginBottom: 2 }}>
                          {n.title}
                        </div>
                        {n.content && (
                          <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {n.content}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--clr-text-light)', marginTop: 4 }}>
                          {formatTime(n.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        {!n.isRead && (
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--clr-primary)', display: 'block' }} />
                        )}
                        <button
                          onClick={e => handleDelete(e, n._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--clr-text-light)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 2 }}
                          title="Dismiss"
                        >✕</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--clr-border)', background: 'var(--clr-bg-2)', textAlign: 'center' }}>
                <button onClick={handleClearAll} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: 'var(--clr-error)', cursor: 'pointer' }}>
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
