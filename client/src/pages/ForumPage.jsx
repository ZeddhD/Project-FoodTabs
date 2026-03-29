import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useForumStore } from '../context/store';
import { forumAPI } from '../services/api';
import PostCard from '../components/PostCard';

const CATEGORIES = [
  { value: '', label: 'All Topics' },
  { value: 'Best in City', label: 'Best in City' },
  { value: 'Hidden Gems', label: 'Hidden Gems' },
  { value: 'Bad Experiences', label: 'Bad Experiences' },
  { value: 'Ask the Community', label: 'Ask the Community' },
  { value: 'Deals and Offers', label: 'Deals & Offers' },
  { value: 'Neighbourhood Eats', label: 'Neighbourhood Eats' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Upvoted' },
  { value: 'discussed', label: 'Most Discussed' },
];

export default function ForumPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { posts, setPosts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useForumStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedCategory, sortBy, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sort: sortBy === 'newest' ? '-createdAt' : sortBy === 'popular' ? '-likeCount' : '-commentsCount'
      };
      const response = await forumAPI.getPosts(params);
      setPosts(response.data.data?.posts || []);
      setTotalPages(response.data.data?.pagination?.pages || 1);
      setTotal(response.data.data?.pagination?.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(selectedCategory === value ? '' : value);
    setPage(1);
  };

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '32px var(--px) 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Community Forum
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--clr-dark)', margin: 0, marginBottom: 6 }}>
            The Food Conversation
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--clr-text-muted)' }}>
            Share discoveries, ask questions, and connect with Dhaka's food community.
            {total > 0 && <span style={{ marginLeft: 8, fontWeight: 600, color: 'var(--clr-text)' }}>{total} discussions</span>}
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => navigate('/forum/create')}
            className="btn btn-primary"
          >
            ✏️ Start Discussion
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div style={{
        background: 'var(--clr-bg-2)', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--clr-border)', padding: '20px', marginBottom: 24
      }}>
        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
          <input
            type="text"
            className="search-bar__input"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="btn btn-ghost btn-sm" onClick={() => handleSearchChange('')}>✕</button>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`filter-chip${(selectedCategory === cat.value || (!selectedCategory && cat.value === '')) ? ' active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--clr-text-muted)', fontWeight: 500 }}>Sort:</span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setPage(1); }}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: sortBy === opt.value ? 'none' : '1px solid var(--clr-border)',
                background: sortBy === opt.value ? 'var(--clr-dark)' : 'white',
                color: sortBy === opt.value ? 'white' : 'var(--clr-text)',
                cursor: 'pointer'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: 16, background: 'var(--clr-error-light, #FEE)', color: 'var(--clr-error)', borderRadius: 'var(--r-md)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: 20, border: '1px solid var(--clr-border)' }}>
              <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 4, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 4, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onDelete={handlePostDelete} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx-1] !== p-1 && <span style={{ padding: '6px 4px', color: 'var(--clr-text-muted)' }}>…</span>}
                    <button
                      className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  </span>
                ))
              }
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">💬</div>
          <div className="empty-state__title">
            {searchQuery || selectedCategory ? 'No discussions found' : 'No activity in this category yet'}
          </div>
          <div className="empty-state__desc">
            {searchQuery || selectedCategory
              ? 'Try a different search or category.'
              : 'Be the first to start a conversation — food opinions are worth sharing.'}
          </div>
          {isAuthenticated && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/forum/create')}>
              Start the First Discussion
            </button>
          )}
        </div>
      )}
    </div>
  );
}
