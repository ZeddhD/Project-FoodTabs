import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useForumStore } from '../context/store';
import { forumAPI } from '../services/api';
import CommentThread from '../components/CommentThread';
import VoteButtons from '../components/VoteButtons';
import ReportModal from '../components/ReportModal';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedPost, setSelectedPost, comments, setComments } = useForumStore();
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [isEditing, setIsEditing]   = useState(false);
  const [editTitle, setEditTitle]   = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags]     = useState('');
  const [saving, setSaving]         = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => { fetchPostDetails(); }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const res = await forumAPI.getPost(postId);
      setSelectedPost(res.data.data);
      setEditTitle(res.data.data.title);
      setEditContent(res.data.data.content);
      setEditTags(res.data.data.tags?.join(', ') || '');
      const commentsRes = await forumAPI.getComments(postId);
      setComments(commentsRes.data.data?.comments || []);
      setError(null);
    } catch {
      setError('Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await forumAPI.updatePost(postId, {
        title: editTitle,
        content: editContent,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setSelectedPost(res.data.data);
      setIsEditing(false);
    } catch {
      setError('Failed to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await forumAPI.deletePost(postId);
      navigate('/forum');
    } catch {
      setError('Failed to delete post.');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error && !selectedPost) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ padding: '14px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
        <Link to="/forum" style={{ color: 'var(--clr-primary)', fontWeight: 600, fontSize: 14 }}>← Back to Forum</Link>
      </div>
    );
  }

  if (!selectedPost) return null;

  const isOwn  = user?._id === selectedPost.userId?._id || user?.id === selectedPost.userId?._id;
  const isAdmin = user?.role === 'admin';
  const createdAt = selectedPost.createdAt
    ? new Date(selectedPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 60px' }}>

      <Link to="/forum" style={{ color: 'var(--clr-primary)', fontSize: 13, fontWeight: 600, display: 'inline-block', marginBottom: 20 }}>
        ← Back to Forum
      </Link>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Post card */}
      <div style={{
        background: 'white', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--clr-border)',
        boxShadow: 'var(--shadow-sm)', padding: '24px', marginBottom: 24
      }}>
        {isEditing ? (
          <>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="form-input"
              style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}
              placeholder="Post title"
            />
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="form-input"
              rows={8}
              style={{ marginBottom: 12, resize: 'vertical' }}
              placeholder="Post content"
            />
            <input
              type="text"
              value={editTags}
              onChange={e => setEditTags(e.target.value)}
              className="form-input"
              style={{ marginBottom: 16 }}
              placeholder="Tags (comma-separated)"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleUpdate} disabled={saving} className="btn btn-primary btn-sm">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setIsEditing(false)} disabled={saving} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: 'var(--clr-dark)', margin: '0 0 8px' }}>
                  {selectedPost.title}
                </h1>
                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--clr-text-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>👤 {selectedPost.userId?.name || 'Anonymous'}</span>
                  {createdAt && <span>📅 {createdAt}</span>}
                  {selectedPost.viewsCount > 0 && <span>👁 {selectedPost.viewsCount} views</span>}
                  {selectedPost.category && (
                    <span className="tag" style={{ color: 'var(--clr-primary)', background: 'var(--clr-primary-light)' }}>
                      {selectedPost.category}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {isAuthenticated && !isOwn && !isAdmin && (
                  <button
                    onClick={() => setReportTarget({ type: 'post', id: selectedPost._id })}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}
                  >
                    Flag
                  </button>
                )}
                {isAuthenticated && (isOwn || isAdmin) && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="btn btn-ghost btn-sm">Edit</button>
                    <button onClick={handleDelete} className="btn btn-danger btn-sm">Delete</button>
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            {selectedPost.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {selectedPost.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* Content */}
            <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--clr-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 20 }}>
              {selectedPost.content}
            </div>

            {/* Voting */}
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--clr-border)' }}>
              <VoteButtons parentId={selectedPost._id} parentType="Post" />
            </div>
          </>
        )}
      </div>

      {/* Comments */}
      {!isEditing && (
        <CommentThread
          postId={postId}
          comments={comments}
          onCommentAdded={c => { setComments([...comments, c]); fetchPostDetails(); }}
          onCommentDeleted={id => setComments(comments.filter(c => c._id !== id))}
        />
      )}

      <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} />
    </div>
  );
}
