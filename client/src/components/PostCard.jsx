import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { forumAPI } from '../services/api';
import VoteButtons from './VoteButtons';
import { StarRating } from './common';
import ReportModal from './ReportModal';

const CATEGORY_COLORS = {
  'Best in City':      { bg: '#FFF3EC', color: '#E8460B' },
  'Hidden Gems':       { bg: '#ECFDF5', color: '#059669' },
  'Bad Experiences':   { bg: '#FEF2F2', color: '#DC2626' },
  'Ask the Community': { bg: '#EFF6FF', color: '#2563EB' },
  'Deals and Offers':  { bg: '#FFFBEB', color: '#D97706' },
  'Neighbourhood Eats':{ bg: '#F5F3FF', color: '#7C3AED' },
};

export default function PostCard({ post, onDelete, onUpdate }) {
  const { isAuthenticated, user } = useAuthStore();
  const [reportTarget, setReportTarget] = useState(null);

  const authorName  = post.userId?.name || 'Anonymous';
  const initial     = authorName[0]?.toUpperCase() || '?';
  const createdAt   = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const catStyle    = CATEGORY_COLORS[post.category] || { bg: '#f0f0f0', color: '#666' };
  const restaurant  = post.linkedRestaurantId;

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      try {
        await forumAPI.deletePost(post._id);
        onDelete?.(post._id);
      } catch {}
    }
  };

  const isOwn = user?._id === post.userId?._id || user?.id === post.userId?._id;

  return (
    <div
      style={{
        background: 'white', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--clr-border)',
        padding: '18px 20px', transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Top row: author + category + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8460B, #FFB800)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0
          }}>{initial}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-text)' }}>{authorName}</span>
          <span style={{ fontSize: 12, color: 'var(--clr-text-light)' }}>{createdAt}</span>
          {post.category && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
              background: catStyle.bg, color: catStyle.color
            }}>{post.category}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {isAuthenticated && !isOwn && user?.role !== 'admin' && (
            <button
              onClick={() => setReportTarget({ type: 'post', id: post._id })}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--clr-text-muted)' }}
            >
              Flag
            </button>
          )}
          {isAuthenticated && (isOwn || user?.role === 'admin') && (
            <>
              <Link to={`/forum/${post._id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
              <button onClick={handleDelete} className="btn btn-danger btn-sm">Delete</button>
            </>
          )}
        </div>
      </div>

      {/* Restaurant tag with rating */}
      {restaurant && (
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link
            to={`/restaurant/${restaurant._id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--clr-bg-alt)', borderRadius: 20, padding: '3px 10px',
              fontSize: 12, fontWeight: 600, color: 'var(--clr-text)', textDecoration: 'none',
              border: '1px solid var(--clr-border)'
            }}
          >
            📍 {restaurant.name}
            {restaurant.rating > 0 && (
              <span style={{ color: '#E8460B', fontWeight: 700 }}>
                · {restaurant.rating.toFixed(1)} ★
              </span>
            )}
            {restaurant.reviewsCount > 0 && (
              <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400 }}>
                ({restaurant.reviewsCount})
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Title */}
      <Link
        to={`/forum/${post._id}`}
        style={{
          display: 'block', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800,
          color: 'var(--clr-dark)', textDecoration: 'none', lineHeight: 1.35, marginBottom: 8
        }}
      >
        {post.title}
      </Link>

      {/* Content excerpt */}
      <p style={{
        color: 'var(--clr-text-muted)', lineHeight: 1.6, fontSize: 13, marginBottom: 12,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
      }}>
        {post.content}
      </p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 20,
              background: '#f0f0f0', color: 'var(--clr-text-muted)'
            }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer: votes + comments + read more */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <VoteButtons
            parentId={post._id}
            parentType="Post"
            initialScore={post.likeCount || 0}
          />
          <Link
            to={`/forum/${post._id}`}
            style={{ fontSize: 13, color: 'var(--clr-text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            💬 <span>{post.commentsCount || 0} {post.commentsCount !== 1 ? 'comments' : 'comment'}</span>
          </Link>
          {post.viewsCount > 0 && (
            <span style={{ fontSize: 12, color: 'var(--clr-text-light)' }}>
              👁 {post.viewsCount}
            </span>
          )}
        </div>
        <Link to={`/forum/${post._id}`} className="btn btn-ghost btn-sm">
          Read →
        </Link>
      </div>
      <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} />
    </div>
  );
}
