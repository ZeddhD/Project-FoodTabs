import { useState } from 'react';
import { useAuthStore } from '../context/store';
import { voteAPI } from '../services/api';

export default function VoteButtons({
  parentId,
  parentType = 'Post',
  initialScore = 0,
  currentUserVote = null,
  onVoteChange
}) {
  const { user } = useAuthStore();
  const [score, setScore]   = useState(initialScore);
  const [myVote, setMyVote] = useState(currentUserVote);
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState('');

  // Owners read posts/comments but cannot vote
  const isOwner = user?.role === 'owner';

  const handleVote = async (value) => {
    if (busy || isOwner) return;
    setBusy(true);
    setErr('');
    try {
      const res = await voteAPI.cast({ parentId, parentType, value });
      const msg = res.data?.message || '';
      if (msg === 'Vote removed') {
        setScore(s => s - myVote);
        setMyVote(null);
      } else if (msg === 'Vote updated') {
        setScore(s => s + (value - myVote));
        setMyVote(value);
      } else {
        setScore(s => s + value);
        setMyVote(value);
      }
      onVoteChange?.();
    } catch {
      setErr('Vote failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const activeUp   = myVote === 1;
  const activeDown = myVote === -1;

  // Owner view: score display only
  if (isOwner) {
    return (
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: score > 0 ? 'var(--clr-primary)' : score < 0 ? '#EF4444' : 'var(--clr-text-light)',
        display: 'flex', alignItems: 'center', gap: 4
      }}>
        ▲ {score}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={() => handleVote(1)}
        disabled={busy}
        title="Upvote"
        style={{
          background: activeUp ? 'var(--clr-primary)' : 'var(--clr-primary-light)',
          color:      activeUp ? 'white'               : 'var(--clr-primary)',
          border:     `1px solid var(--clr-primary)`,
          padding:    '4px 10px',
          borderRadius: 'var(--r-sm)',
          cursor:     busy ? 'not-allowed' : 'pointer',
          fontWeight: 700, fontSize: 13,
          opacity:    busy ? 0.6 : 1,
          transition: 'all 0.15s'
        }}
      >
        ▲
      </button>

      <span style={{
        minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 14,
        color: score > 0 ? 'var(--clr-primary)' : score < 0 ? '#EF4444' : 'var(--clr-text-light)'
      }}>
        {score}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={busy}
        title="Downvote"
        style={{
          background: activeDown ? '#EF4444' : '#FEF2F2',
          color:      activeDown ? 'white'   : '#EF4444',
          border:     '1px solid #EF4444',
          padding:    '4px 10px',
          borderRadius: 'var(--r-sm)',
          cursor:     busy ? 'not-allowed' : 'pointer',
          fontWeight: 700, fontSize: 13,
          opacity:    busy ? 0.6 : 1,
          transition: 'all 0.15s'
        }}
      >
        ▼
      </button>

      {err && <span style={{ fontSize: 11, color: '#EF4444', marginLeft: 4 }}>{err}</span>}
    </div>
  );
}
