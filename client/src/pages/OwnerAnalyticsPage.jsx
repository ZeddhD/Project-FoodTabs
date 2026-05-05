import { useState, useEffect } from 'react';
import { restaurantAPI, analyticsAPI, dishAPI } from '../services/api';
import AnalyticsChart from '../components/AnalyticsChart';

const CRITERIA_COLORS = {
  taste: '#E8460B', hygiene: '#0BA3A3', service: '#2563EB',
  ambience: '#7C3AED', value: '#16A34A',
};
const CRITERIA_LABELS = {
  taste: 'Taste', hygiene: 'Hygiene', service: 'Service',
  ambience: 'Ambience', value: 'Value',
};

function objectToChartData(obj) {
  return Object.entries(obj)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ label: key, value }));
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: 'white', borderRadius: 'var(--r-lg)',
      border: '1px solid var(--clr-border)', padding: '20px 24px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function DishInsightChip({ dish, color }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', borderRadius: 'var(--r-md)',
      border: '1px solid var(--clr-border)', background: 'white', fontSize: 13
    }}>
      <div>
        <div style={{ fontWeight: 700, color: 'var(--clr-text)' }}>{dish.name}</div>
        <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', marginTop: 2 }}>{dish.category || '—'}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
        {dish.rating > 0
          ? <div style={{ fontWeight: 800, color, fontSize: 14 }}>{dish.rating.toFixed(1)}★</div>
          : <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>No rating</div>
        }
        <div style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>
          {dish.reviewsCount} review{dish.reviewsCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

export default function OwnerAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [dishes, setDishes]       = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const restRes = await restaurantAPI.getOwnerRestaurants();
      if (!restRes.data.data?.length) { setError('No restaurant found for your account.'); return; }
      const rest = restRes.data.data[0];
      setRestaurant(rest);

      const [analyticsRes, dishesRes] = await Promise.all([
        analyticsAPI.getRestaurantAnalytics(rest._id),
        dishAPI.getAll(rest._id, { limit: 100 }),
      ]);

      setAnalytics(analyticsRes.data.data);
      setDishes(dishesRes.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ padding: 16, background: '#FEE', color: 'var(--clr-error)', borderRadius: 'var(--r-md)' }}>
          {error || 'No analytics data available yet.'}
        </div>
      </div>
    );
  }

  const ov = analytics.overview || {};
  const rt = analytics.ratings  || {};
  const tr = analytics.trends   || {};

  // ── Restaurant health ──
  const overallRating = parseFloat(ov.averageRating || 0);
  const getHealthInfo = (score, hasData) => {
    if (!hasData)     return { label: 'No reviews yet', color: '#6B7280', bg: '#F9FAFB' };
    if (score >= 4.5) return { label: 'Excellent',      color: '#16A34A', bg: '#DCFCE7' };
    if (score >= 4.0) return { label: 'Good',           color: '#2563EB', bg: '#EFF6FF' };
    if (score >= 3.0) return { label: 'Fair',           color: '#CA8A04', bg: '#FEF9C3' };
    return               { label: 'Needs Work',      color: '#DC2626', bg: '#FEE2E2' };
  };
  const health = getHealthInfo(overallRating, (ov.totalReviews || 0) > 0);

  const criteriaRanked = Object.entries(CRITERIA_LABELS)
    .map(([key, label]) => ({ key, label, value: rt[key] || 0 }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const strongest = criteriaRanked[0] || null;
  const weakest   = criteriaRanked.length > 1 ? criteriaRanked[criteriaRanked.length - 1] : null;

  // ── Menu segmentation ──
  const starDishes    = dishes.filter(d => d.rating >= 4.0 && d.reviewsCount >= 2).sort((a, b) => b.rating - a.rating);
  const slowDishes    = dishes.filter(d => d.reviewsCount <= 1).sort((a, b) => a.reviewsCount - b.reviewsCount);

  // Genuinely bad dishes (< 3.5★ with enough reviews)
  const genuineProblemDishes = dishes
    .filter(d => d.rating > 0 && d.rating < 3.5 && d.reviewsCount >= 2)
    .sort((a, b) => a.rating - b.rating);

  // If no genuinely bad dishes, show dishes performing below the restaurant's own average
  const belowAvgDishes = genuineProblemDishes.length === 0
    ? dishes
        .filter(d => d.rating > 0 && d.rating < overallRating && d.reviewsCount >= 2)
        .sort((a, b) => a.rating - b.rating)
        .slice(0, 4)
    : [];

  const attentionDishes   = genuineProblemDishes.length > 0 ? genuineProblemDishes : belowAvgDishes;
  const attentionLabel    = genuineProblemDishes.length > 0 ? 'Needs Attention'        : 'Room for Improvement';
  const attentionSubtitle = genuineProblemDishes.length > 0 ? 'Below 3.5★ · 2+ reviews' : `Below restaurant avg (${overallRating.toFixed(1)}★) · 2+ reviews`;
  const attentionColor    = genuineProblemDishes.length > 0 ? '#DC2626' : '#CA8A04';
  const attentionBg       = genuineProblemDishes.length > 0 ? '#FEF2F2' : '#FFFBEB';
  const attentionBorder   = genuineProblemDishes.length > 0 ? '#FECACA' : '#FDE68A';
  const noAttentionMsg    = genuineProblemDishes.length > 0
    ? 'No low-rated dishes — great sign!'
    : 'All dishes are at or above your restaurant average.';

  // ── Chart data ──
  const reviewTrendData  = objectToChartData(tr.reviewsByMonth || {});

  // ── Booking status breakdown ──
  const bookingStatusData = [
    { label: 'Pending',   value: ov.pendingBookings   || 0, color: '#CA8A04' },
    { label: 'Confirmed', value: ov.confirmedBookings || 0, color: '#16A34A' },
    { label: 'Completed', value: ov.completedBookings || 0, color: '#2563EB' },
    { label: 'Cancelled', value: ov.cancelledBookings || 0, color: '#DC2626' },
  ].filter(s => s.value > 0);

  // ── Dish table ──
  const dishesWithRating = dishes.filter(d => d.rating > 0).sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Analytics</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>
          {restaurant?.name}
        </h1>
      </div>

      {/* ── Top stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Bookings" value={ov.totalBookings ?? 0}   color="#2563EB"
          sub={(ov.totalBookings || 0) > 0 ? `${ov.totalBookings} reservations made` : null} />
        <StatCard label="Guests Hosted"  value={ov.totalGuests   ?? 0}   color="#16A34A"
          sub={(ov.totalBookings || 0) > 0 ? `across ${ov.totalBookings} bookings` : null} />
        <StatCard label="Deposit Revenue" value={`৳${(ov.totalRevenue || 0).toLocaleString()}`} color="#16A34A"
          sub={(ov.paymentsCount || 0) > 0 ? `${ov.paymentsCount} paid deposit${ov.paymentsCount !== 1 ? 's' : ''}` : 'No deposits yet'} />
        <StatCard label="Average Rating" value={`${overallRating.toFixed(1)} ★`} color="#E8460B"
          sub={`${ov.totalReviews ?? 0} total reviews`} />
        <StatCard label="Dishes on Menu" value={ov.totalDishes ?? dishes.length} color="#7C3AED"
          sub={dishesWithRating.length > 0 ? `${dishesWithRating.length} rated by customers` : 'No ratings yet'} />
      </div>

      {/* ── Booking Breakdown ── */}
      {(ov.totalBookings || 0) > 0 && (
        <div style={{
          background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)',
          padding: '20px 24px', marginBottom: 24
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>Booking Breakdown</h3>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {bookingStatusData.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>{s.label}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
            {(ov.totalEventBookings || 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#7C3AED', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Event Bookings</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#7C3AED' }}>{ov.totalEventBookings}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Restaurant Health Assessment ── */}
      {(ov.totalReviews || 0) > 0 && (
        <div style={{
          background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)',
          padding: '20px 24px', marginBottom: 24
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>
            Restaurant Health
          </h3>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Verdict badge */}
            <div style={{ padding: '14px 20px', borderRadius: 'var(--r-md)', background: health.bg, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: health.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                Overall Status
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: health.color }}>
                {health.label}
              </div>
              <div style={{ fontSize: 12, color: health.color, opacity: 0.8, marginTop: 2 }}>
                {overallRating.toFixed(2)} / 5 · {ov.totalReviews} review{ov.totalReviews !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Criteria insights */}
            {criteriaRanked.length > 0 && (
              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                {strongest && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ fontSize: 16 }}>👍</span>
                    <span style={{ color: 'var(--clr-text-muted)' }}>Strongest area:</span>
                    <span style={{ fontWeight: 700, color: CRITERIA_COLORS[strongest.key] }}>
                      {strongest.label} ({strongest.value.toFixed(1)}★)
                    </span>
                  </div>
                )}
                {weakest && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ fontSize: 16 }}>📌</span>
                    <span style={{ color: 'var(--clr-text-muted)' }}>Area to improve:</span>
                    <span style={{ fontWeight: 700, color: CRITERIA_COLORS[weakest.key] }}>
                      {weakest.label} ({weakest.value.toFixed(1)}★)
                    </span>
                  </div>
                )}
                {genuineProblemDishes.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span style={{ color: 'var(--clr-text-muted)' }}>Low-rated dishes:</span>
                    <span style={{ fontWeight: 700, color: '#DC2626' }}>
                      {genuineProblemDishes.length} dish{genuineProblemDishes.length !== 1 ? 'es' : ''} need attention
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Menu Insights ── */}
      {dishes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, margin: '0 0 14px' }}>Menu Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

            {/* Star Performers */}
            <div style={{ background: '#F0FDF4', borderRadius: 'var(--r-lg)', border: '1px solid #BBF7D0', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>⭐</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#16A34A' }}>Star Performers</div>
                  <div style={{ fontSize: 11, color: '#15803D' }}>4.0★ or higher · 2+ reviews</div>
                </div>
              </div>
              {starDishes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {starDishes.map(d => <DishInsightChip key={d._id} dish={d} color="#16A34A" />)}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#15803D', fontStyle: 'italic', margin: 0 }}>
                  No dish has 2+ reviews at 4★ yet.
                </p>
              )}
            </div>

            {/* Needs Attention / Room for Improvement */}
            <div style={{ background: attentionBg, borderRadius: 'var(--r-lg)', border: `1px solid ${attentionBorder}`, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>{genuineProblemDishes.length > 0 ? '⚠️' : '📈'}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: attentionColor }}>{attentionLabel}</div>
                  <div style={{ fontSize: 11, color: attentionColor, opacity: 0.8 }}>{attentionSubtitle}</div>
                </div>
              </div>
              {attentionDishes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attentionDishes.map(d => <DishInsightChip key={d._id} dish={d} color={attentionColor} />)}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: attentionColor, fontStyle: 'italic', margin: 0, opacity: 0.8 }}>
                  {noAttentionMsg}
                </p>
              )}
            </div>

            {/* Undiscovered */}
            <div style={{ background: '#FFFBEB', borderRadius: 'var(--r-lg)', border: '1px solid #FDE68A', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>👁️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#B45309' }}>Undiscovered</div>
                  <div style={{ fontSize: 11, color: '#92400E' }}>0–1 reviews · needs visibility</div>
                </div>
              </div>
              {slowDishes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {slowDishes.map(d => <DishInsightChip key={d._id} dish={d} color="#B45309" />)}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#92400E', fontStyle: 'italic', margin: 0 }}>
                  All dishes have multiple reviews!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Review Criteria Averages ── */}
      {criteriaRanked.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)',
          padding: '20px 24px', marginBottom: 24
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>Review Criteria Averages</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
              const val = rt[key] || 0;
              if (!val) return null;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 72, fontSize: 13, color: 'var(--clr-text-muted)', flexShrink: 0 }}>{label}</div>
                  <div style={{ flex: 1, height: 10, background: 'var(--clr-bg-alt)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: CRITERIA_COLORS[key], borderRadius: 99, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ width: 32, fontSize: 13, fontWeight: 700, color: CRITERIA_COLORS[key], textAlign: 'right', flexShrink: 0 }}>
                    {val.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Review Volume by Month ── */}
      {reviewTrendData.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <AnalyticsChart type="line" title="Review Volume by Month" data={reviewTrendData} xAxisLabel="Month" yAxisLabel="Reviews" />
        </div>
      )}

      {/* ── Dish Ratings table ── */}
      {dishesWithRating.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)',
          padding: '20px 24px', marginBottom: 24
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>Dish Ratings</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--clr-bg-alt)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--clr-text)' }}>Dish</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--clr-text)' }}>Category</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--clr-text)' }}>Rating</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--clr-text)' }}>Reviews</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--clr-text)' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {dishesWithRating.map((dish, i) => {
                  const ratingColor = dish.rating >= 4 ? '#16A34A' : dish.rating >= 3 ? '#CA8A04' : '#DC2626';
                  return (
                    <tr key={dish._id} style={{ borderBottom: i < dishesWithRating.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                      <td style={{ padding: '11px 12px', fontWeight: 600 }}>{dish.name}</td>
                      <td style={{ padding: '11px 12px', color: 'var(--clr-text-muted)', fontSize: 13 }}>{dish.category || '—'}</td>
                      <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 700, color: ratingColor }}>{dish.rating.toFixed(1)} ★</td>
                      <td style={{ padding: '11px 12px', textAlign: 'right', color: 'var(--clr-text-muted)' }}>{dish.reviewsCount}</td>
                      <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--clr-primary)' }}>৳{dish.price?.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Full Summary ── */}
      <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '20px 24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>Full Summary</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--clr-bg-alt)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--clr-text)' }}>Metric</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--clr-text)' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Total Bookings',       value: ov.totalBookings      ?? 0,                              color: '#2563EB' },
              { label: '— Pending',            value: ov.pendingBookings    ?? 0,                              color: '#CA8A04' },
              { label: '— Confirmed',          value: ov.confirmedBookings  ?? 0,                              color: '#16A34A' },
              { label: '— Completed',          value: ov.completedBookings  ?? 0,                              color: '#2563EB' },
              { label: '— Cancelled',          value: ov.cancelledBookings  ?? 0,                              color: '#DC2626' },
              { label: 'Deposits Collected',   value: `৳${(ov.totalRevenue || 0).toLocaleString()}`,           color: '#16A34A' },
              { label: '— Paid Bookings',      value: ov.paidBookings       ?? 0,                              color: '#16A34A' },
              { label: 'Total Guests Hosted',  value: ov.totalGuests        ?? 0,                              color: '#0BA3A3' },
              { label: 'Event Bookings',       value: ov.totalEventBookings ?? 0,                              color: '#7C3AED' },
              { label: 'Total Reviews',        value: ov.totalReviews       ?? 0,                              color: '#E8460B' },
              { label: 'Average Rating',       value: `${overallRating.toFixed(2)} / 5`,                       color: '#E8460B' },
              { label: 'Restaurant Health',    value: health.label,                                             color: health.color },
              { label: 'Dishes on Menu',       value: ov.totalDishes        ?? dishes.length,                  color: '#7C3AED' },
              { label: '— Star Performers',    value: starDishes.length,                                        color: '#16A34A' },
              { label: '— Needs Attention',    value: genuineProblemDishes.length,                              color: '#DC2626' },
              { label: '— Undiscovered',       value: slowDishes.length,                                        color: '#B45309' },
            ].map((row, i, arr) => (
              <tr key={row.label} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                <td style={{ padding: '11px 12px', color: row.label.startsWith('—') ? 'var(--clr-text-muted)' : 'var(--clr-text)', paddingLeft: row.label.startsWith('—') ? 24 : 12 }}>
                  {row.label.startsWith('—') ? row.label.slice(2) : row.label}
                </td>
                <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 700, color: row.color }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
