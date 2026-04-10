import { useState } from 'react';
import { forumAPI } from '../services/api';

export default function VoteButtons({ postId, initialVotes = 0, currentUserVote = null, onVoteChange }) {
  const [votes, setVotes] = useState(initialVotes || 0);
  const [userVote, setUserVote] = useState(currentUserVote);
  const [loading, setLoading] = useState(false);

  const handleUpvote = async () => {
    try {
      setLoading(true);
      if (userVote === 'up') {
        await forumAPI.removeVote(postId);
        setVotes(votes - 1);
        setUserVote(null);
      } else {
        await forumAPI.upvote(postId);
        if (userVote === 'down') {
          setVotes(votes + 2);
        } else {
          setVotes(votes + 1);
        }
        setUserVote('up');
      }
      onVoteChange?.();
    } catch (error) {
      console.error('Error upvoting:', error);
      alert('Failed to upvote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownvote = async () => {
    try {
      setLoading(true);
      if (userVote === 'down') {
        await forumAPI.removeVote(postId);
        setVotes(votes + 1);
        setUserVote(null);
      } else {
        await forumAPI.downvote(postId);
        if (userVote === 'up') {
          setVotes(votes - 2);
        } else {
          setVotes(votes - 1);
        }
        setUserVote('down');
      }
      onVoteChange?.();
    } catch (error) {
      console.error('Error downvoting:', error);
      alert('Failed to downvote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      background: '#f5f5f5',
      borderRadius: '4px',
      width: 'fit-content'
    }}>
      <button
        onClick={handleUpvote}
        disabled={loading}
        style={{
          background: userVote === 'up' ? '#4CAF50' : '#e0e0e0',
          color: userVote === 'up' ? 'white' : '#666',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          opacity: loading ? 0.6 : 1
        }}
        title="Upvote"
      >
        👍
      </button>
      
      <span style={{
        fontSize: '16px',
        fontWeight: 'bold',
        minWidth: '30px',
        textAlign: 'center',
        color: votes > 0 ? '#4CAF50' : votes < 0 ? '#f44336' : '#666'
      }}>
        {votes}
      </span>
      
      <button
        onClick={handleDownvote}
        disabled={loading}
        style={{
          background: userVote === 'down' ? '#f44336' : '#e0e0e0',
          color: userVote === 'down' ? 'white' : '#666',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          opacity: loading ? 0.6 : 1
        }}
        title="Downvote"
      >
        👎
      </button>
    </div>
  );
}