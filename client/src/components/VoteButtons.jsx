import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/store';
import { voteAPI } from '../services/api';

export default function VoteButtons({
  parentId,
  parentType = 'Post',
  onVoteChange
}) {
  const { user } = useAuthStore();
  const [upvotes,   setUpvotes]   = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [myVote,    setMyVote]    = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [err,       setErr]       = useState('');

  const isOwner = user?.role === 'owner';

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await voteAPI.getVotes({ parentId, parentType });
        const votes = res.data?.data || [];
        setUpvotes(votes.filter(v => v.value === 1).length);
        setDownvotes(votes.filter(v => v.value === -1).length);
        if (user) {
          const mine = votes.find(v => String(v.userId) === String(user._id || user.id));
          setMyVote(mine?.value ?? null);
        }
      } catch {}
    };
    fetchVotes();
  }, [parentId, parentType]);

  const handleVote = async (value) => {
    if (busy || isOwner) return;
    setBusy(true);
    setErr('');
    try {
      const res = await voteAPI.cast({ parentId, parentType, value });
      const msg = res.data?.message || '';

      if (msg === 'Vote removed') {
        if (myVote === 1)  setUpvotes(u => u - 1);
        if (myVote === -1) setDownvotes(d => d - 1);
        setMyVote(null);
      } else if (msg === 'Vote updated') {
        if (value === 1)  { setUpvotes(u => u + 1); setDownvotes(d => d - 1); }
        if (value === -1) { setDownvotes(d => d + 1); setUpvotes(u => u - 1); }
        setMyVote(value);
      } else {
        if (value === 1)  setUpvotes(u => u + 1);
        if (value === -1) setDownvotes(d => d + 1);
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

  if (isOwner) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ▲ {upvotes}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
          ▼ {downvotes}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={() => handleVote(1)}
        disabled={busy}
        title="Upvote"
        style={{
          background:   activeUp ? 'var(--clr-primary)' : 'var(--clr-primary-light)',
          color:        activeUp ? 'white' : 'var(--clr-primary)',
          border:       '1px solid var(--clr-primary)',
          padding:      '4px 10px',
          borderRadius: 'var(--r-sm)',
          cursor:       busy ? 'not-allowed' : 'pointer',
          fontWeight:   700, fontSize: 13,
          opacity:      busy ? 0.6 : 1,
          transition:   'all 0.15s',
          display:      'flex', alignItems: 'center', gap: 5
        }}
      >
        ▲ <span>{upvotes}</span>
      </button>

      <button
        onClick={() => handleVote(-1)}
        disabled={busy}
        title="Downvote"
        style={{
          background:   activeDown ? '#EF4444' : '#FEF2F2',
          color:        activeDown ? 'white' : '#EF4444',
          border:       '1px solid #EF4444',
          padding:      '4px 10px',
          borderRadius: 'var(--r-sm)',
          cursor:       busy ? 'not-allowed' : 'pointer',
          fontWeight:   700, fontSize: 13,
          opacity:      busy ? 0.6 : 1,
          transition:   'all 0.15s',
          display:      'flex', alignItems: 'center', gap: 5
        }}
      >
        ▼ <span>{downvotes}</span>
      </button>

      {err && <span style={{ fontSize: 11, color: '#EF4444', marginLeft: 4 }}>{err}</span>}
    </div>
  );
}
