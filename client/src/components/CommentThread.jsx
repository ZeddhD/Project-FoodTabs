import { useState } from 'react';
import { useAuthStore } from '../context/store';
import { forumAPI } from '../services/api';
import VoteButtons from './VoteButtons';

export default function CommentThread({ postId, comments = [], onCommentAdded, onCommentDeleted }) {
  const { isAuthenticated, user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await forumAPI.createComment(postId, {
        content: newComment
      });
      setNewComment('');
      onCommentAdded?.(response.data.data);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await forumAPI.updateComment(commentId, {
        content: editText
      });
      setEditingId(null);
      setEditText('');
      onCommentAdded?.(response.data.data);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await forumAPI.deleteComment(commentId);
        onCommentDeleted?.(commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

  return (
    <div style={{
      marginTop: '24px',
      padding: '16px',
      background: '#f9f9f9',
      borderRadius: '8px'
    }}>
      <h3>Comments ({comments?.length || 0})</h3>

      {isAuthenticated && user?.role !== 'owner' ? (
        <form onSubmit={handleAddComment} style={{ marginBottom: '16px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'Arial'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || !newComment.trim() ? 0.6 : 1
            }}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : !isAuthenticated ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          Please log in to add comments.
        </p>
      ) : null}

      {comments && comments.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {comments.map((comment) => (
            <div
              key={comment._id}
              style={{
                padding: '12px',
                background: 'white',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px'
              }}>
                <div>
                  <strong style={{ fontSize: '14px' }}>
                    {comment.userId?.name || 'Anonymous'}
                  </strong>
                  <span style={{
                    color: '#999',
                    fontSize: '12px',
                    marginLeft: '8px'
                  }}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {isAuthenticated && (user?._id === comment.userId?._id || user?.role === 'admin') && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditText(comment.content);
                      }}
                      style={{
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment._id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'Arial'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => handleUpdateComment(comment._id)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: '6px 12px',
                        background: '#999',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  lineHeight: '1.6',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  {comment.content}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <VoteButtons
                  parentId={comment._id}
                  parentType="Comment"
                  initialScore={comment.likeCount || 0}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#999' }}>No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}