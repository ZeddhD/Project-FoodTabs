import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationAPI } from '../services/api.js';
import { RestaurantCard } from './common';

export default function RecommendationsSection() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    recommendationAPI.getSmartRecommendations({ limit: 6 })
      .then(res => setRecommendations(res.data.data || []))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '32px var(--px) 48px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          For You
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--clr-dark)', margin: 0 }}>
          Recommended For You
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--clr-text-muted)' }}>
          Based on your dining history, favourites, and preferences.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: 16 }}>
              <div className="skeleton" style={{ height: 130, borderRadius: 'var(--r-md)', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {recommendations.map(r => (
            <RestaurantCard
              key={r._id}
              restaurant={r}
              onClick={() => navigate(`/restaurant/${r._id}`)}
            />
          ))}
        </div>
      ) : failed ? (
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <div className="empty-state__title">Couldn't load recommendations</div>
          <div className="empty-state__desc">Make sure you're logged in and the server is running.</div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🎯</div>
          <div className="empty-state__title">No recommendations yet</div>
          <div className="empty-state__desc">
            Save a few restaurants to your favourites and we'll suggest similar ones you'll love.
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Discover Restaurants
          </button>
        </div>
      )}
    </div>
  );
}
