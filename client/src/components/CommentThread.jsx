import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { forumAPI } from '../services/api';
import VoteButtons from './VoteButtons';
import ReportModal from './ReportModal';

function CommentItem({ comment, postId, currentUser, onDeleted, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText]         = useState('');
  const [replies, setReplies]             = useState(null); // null = not loaded
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [reportTarget, setReportTarget]   = useState(null);

  const isOwn = currentUser?._id === comment.userId?._id || currentUser?.id === comment.userId?._id;
  const canReply = !!currentUser && currentUser.role !== 'owner' && depth < 2;

  const loadReplies = async () => {
    if (replies !== null) { setReplies(null); return; } // toggle off
    setLoadingReplies(true);
    try {
      const res = await forumAPI.getReplies(comment._id);
      setReplies(res.data?.data || []);
    } catch {}
    finally { setLoadingReplies(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await forumAPI.deleteComment(comment._id);
      onDeleted?.(comment._id);
    } catch {}
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await forumAPI.createComment(postId, {
        content: replyText,
        parentCommentId: comment._id
      });
      setReplyText('');
      setShowReplyForm(false);
      setReplies(prev => prev ? [...prev, res.data.data] : [res.data.data]);
    } catch {}
    finally { setSubmitting(false); }
  };

  const createdAt = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, borderLeft: depth > 0 ? '2px solid var(--clr-border)' : 'none', paddingLeft: depth > 0 ? 14 : 0 }}>
      <div style={{ background: 'white', borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)', padding: '12px 14px', marginBottom: 8 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #E8460B, #FFB800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white'
            }}>
              {(comment.userId?.name || 'U')[0].toUpperCase()}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' }}>{comment.userId?.name || 'Anonymous'}</span>
            <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{createdAt}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {currentUser && !isOwn && currentUser.role !== 'admin' && (
              <button onClick={() => setReportTarget({ type: 'comment', id: comment._id })} className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>
                Flag
              </button>
            )}
            {(isOwn || currentUser?.role === 'admin') && (
              <button onClick={handleDelete} className="btn btn-danger btn-sm" style={{ fontSize: 11 }}>Delete</button>
            )}
          </div>
        </div>

        {/* Content */}
        <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.6, color: 'var(--clr-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {comment.content}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <VoteButtons parentId={comment._id} parentType="Comment" />
          {canReply && (
            <button onClick={() => setShowReplyForm(r => !r)} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
              {showReplyForm ? 'Cancel' : '↩ Reply'}
            </button>
          )}
          {comment.replyCount > 0 || replies !== null ? (
            <button onClick={loadReplies} className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: 'var(--clr-primary)' }} disabled={loadingReplies}>
              {loadingReplies ? 'Loading...' : replies !== null ? 'Hide replies' : `${comment.replyCount || ''} replies ▾`}
            </button>
          ) : null}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <form onSubmit={handleReply} style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="form-input"
              style={{ flex: 1, resize: 'none', fontSize: 13 }}
              disabled={submitting}
            />
            <button type="submit" disabled={!replyText.trim() || submitting} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
              {submitting ? '...' : 'Reply'}
            </button>
          </form>
        )}
      </div>

      {/* Nested replies */}
      {replies !== null && replies.map(reply => (
        <CommentItem
          key={reply._id}
          comment={reply}
          postId={postId}
          currentUser={currentUser}
          onDeleted={(id) => setReplies(prev => prev.filter(r => r._id !== id))}
          depth={depth + 1}
        />
      ))}

      <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} />
    </div>
  );
}

export default function CommentThread({ postId, comments = [], onCommentAdded, onCommentDeleted }) {
  const { isAuthenticated, user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading]       = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await forumAPI.createComment(postId, { content: newComment });
      setNewComment('');
      onCommentAdded?.(res.data.data);
    } catch {
      // swallow — parent refetches on next load; user sees no change
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 16, color: 'var(--clr-dark)' }}>
        Comments ({comments.length})
      </h3>

      {isAuthenticated && user?.role !== 'owner' ? (
        <form onSubmit={handleAddComment} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="form-input"
            style={{ flex: 1, resize: 'none' }}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newComment.trim()} className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      ) : !isAuthenticated ? (
        <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 16 }}>
          Please <Link to="/login" style={{ color: 'var(--clr-primary)' }}>sign in</Link> to comment.
        </p>
      ) : null}

      {comments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              currentUser={user}
              onDeleted={onCommentDeleted}
            />
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}
