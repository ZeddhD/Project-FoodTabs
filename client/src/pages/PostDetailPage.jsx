import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useForumStore } from '../context/store';
import { forumAPI } from '../services/api';
import CommentThread from '../components/CommentThread';
import VoteButtons from '../components/VoteButtons';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedPost, setSelectedPost, comments, setComments } = useForumStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const response = await forumAPI.getPost(postId);
      setSelectedPost(response.data.data);
      setEditTitle(response.data.data.title);
      setEditContent(response.data.data.content);
      setEditTags(response.data.data.tags?.join(', ') || '');
      
      // Fetch comments
      const commentsResponse = await forumAPI.getComments(postId);
      setComments(commentsResponse.data.data?.comments || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title and content cannot be empty');
      return;
    }

    try {
      const response = await forumAPI.updatePost(postId, {
        title: editTitle,
        content: editContent,
        tags: editTags.split(',').map(t => t.trim()).filter(t => t)
      });
      setSelectedPost(response.data.data);
      setIsEditing(false);
      alert('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await forumAPI.deletePost(postId);
        alert('Post deleted successfully!');
        navigate('/forum');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
    fetchPostDetails();
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId));
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        ⏳ Loading post...
      </div>
    );
  }

  if (error || !selectedPost) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          padding: '16px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error || 'Post not found.'}
        </div>
        <Link
          to="/forum"
          style={{
            color: '#2196F3',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          ← Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button */}
      <Link
        to="/forum"
        style={{
          display: 'inline-block',
          marginBottom: '16px',
          color: '#2196F3',
          textDecoration: 'none',
          fontWeight: '500'
        }}
      >
        ← Back to Forum
      </Link>

      {/* Post Header */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        marginBottom: '24px'
      }}>
        {isEditing ? (
          <>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '20px',
                fontWeight: '600'
              }}
              placeholder="Post title"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '12px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Arial'
              }}
              placeholder="Post content"
            />
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Tags (comma-separated)"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleUpdate}
                style={{
                  padding: '8px 16px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '8px 16px',
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '16px'
            }}>
              <div>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
                  {selectedPost.title}
                </h1>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>👤 {selectedPost.userId?.name || 'Anonymous'}</span>
                  <span>📅 {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                  {selectedPost.category && (
                    <span style={{
                      padding: '4px 12px',
                      background: '#e3f2fd',
                      color: '#2196F3',
                      borderRadius: '16px'
                    }}>
                      {selectedPost.category}
                    </span>
                  )}
                </div>
              </div>

              {isAuthenticated && (user?._id === selectedPost.userId?._id || user?.role === 'admin') && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '6px 12px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: '6px 12px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
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

            {/* Tags */}
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                {selectedPost.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 12px',
                      background: '#f0f0f0',
                      color: '#666',
                      borderRadius: '16px',
                      fontSize: '12px'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div style={{
              lineHeight: '1.8',
              color: '#333',
              fontSize: '16px',
              marginBottom: '20px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {selectedPost.content}
            </div>

            {/* Voting */}
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <VoteButtons
                parentId={selectedPost._id}
                parentType="Post"
                initialScore={selectedPost.likeCount || 0}
              />
            </div>
          </>
        )}
      </div>

      {/* Comments Section */}
      {!isEditing && (
        <CommentThread
          postId={postId}
          comments={comments}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </div>
  );
}