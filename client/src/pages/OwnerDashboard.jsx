import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { restaurantAPI, reviewAPI, verificationAPI } from '../services/api';
import { CriteriaFullBars, StarRating, VerifiedBadgeSVG, ReviewCard } from '../components/common';

function DepositSettings({ restaurant, onSaved }) {
  const [amount, setAmount]   = useState(restaurant.bookingDeposit ?? 0);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState(null);

  const handleSave = async () => {
    const val = Math.max(0, parseInt(amount, 10) || 0);
    try {
      setSaving(true);
      setMsg(null);
      await restaurantAPI.update(restaurant._id, { bookingDeposit: val });
      setMsg({ type: 'success', text: `Deposit set to ৳${val.toLocaleString()}` });
      onSaved(val);
    } catch {
      setMsg({ type: 'error', text: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '20px 24px', marginBottom: 20 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Booking Deposit</h3>
      <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', margin: '0 0 16px' }}>
        Customers will be required to pay this deposit (in BDT) after making a reservation. Set to 0 for no deposit.
      </p>

      {msg && (
        <div style={{
          padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 13, marginBottom: 12,
          background: msg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color:      msg.type === 'success' ? '#16A34A' : '#DC2626',
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 15, fontWeight: 700, color: 'var(--clr-primary)', pointerEvents: 'none'
          }}>৳</span>
          <input
            type="number"
            min="0"
            step="50"
            value={amount}
            onChange={e => { setAmount(e.target.value); setMsg(null); }}
            className="form-input"
            style={{ paddingLeft: 28, width: 140 }}
            disabled={saving}
          />
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Deposit'}
        </button>
        {restaurant.bookingDeposit > 0 && (
          <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
            Current: ৳{restaurant.bookingDeposit.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

const CRITERIA_COLORS = {
  taste: '#E8460B', hygiene: '#0BA3A3', service: '#2563EB', ambience: '#7C3AED', value: '#16A34A',
};
const CRITERIA_LABELS = { taste: 'Taste', hygiene: 'Hygiene', service: 'Service', ambience: 'Ambience', value: 'Value' };

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [verificationReq, setVerificationReq] = useState(null);
  const [verifLoading, setVerifLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState(null);
  const [creationData, setCreationData] = useState({
    name: '',
    description: '',
    cuisineTypesText: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    averagePrice: '',
    priceRange: '$$',
  });

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const restRes = await restaurantAPI.getOwnerRestaurants();
      if (restRes.data.data?.length > 0) {
        const rest = restRes.data.data[0];
        setRestaurant(rest);
        const [revRes, verifRes] = await Promise.allSettled([
          reviewAPI.getAll({ restaurantId: rest._id, limit: 5, sortBy: 'newest' }),
          verificationAPI.getForRestaurant(rest._id),
        ]);
        if (revRes.status === 'fulfilled') {
          const revData = revRes.value.data.data;
          setReviews(Array.isArray(revData) ? revData : (revData?.reviews || []));
        }
        if (verifRes.status === 'fulfilled') {
          setVerificationReq(verifRes.value.data.data || null);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreationChange = (field) => (e) => {
    setCreationData(prev => ({ ...prev, [field]: e.target.value }));
    setCreateMessage(null);
    setError(null);
  };

  const handleCreateRestaurant = async () => {
    const cuisines = creationData.cuisineTypesText
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    if (!creationData.name.trim() || !creationData.address.trim() || cuisines.length === 0) {
      setError('Restaurant name, address, and cuisine types are required.');
      return;
    }

    setCreating(true);
    setError(null);
    setCreateMessage(null);

    try {
      const payload = {
        name: creationData.name.trim(),
        description: creationData.description.trim(),
        cuisineTypes: cuisines,
        address: creationData.address.trim(),
        city: creationData.city.trim(),
        phone: creationData.phone.trim(),
        email: creationData.email.trim(),
        website: creationData.website.trim(),
        averagePrice: creationData.averagePrice ? parseFloat(creationData.averagePrice) : undefined,
        priceRange: creationData.priceRange,
        openingHours: {},
        bookingDeposit: 0
      };

      const res = await restaurantAPI.create(payload);
      const createdRestaurant = res.data.data;
      setRestaurant(createdRestaurant);
      const verifRes = await verificationAPI.getForRestaurant(createdRestaurant._id);
      setVerificationReq(verifRes.data.data || null);
      setCreateMessage('Restaurant created. Click Request Verification when you are ready for admin approval.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create restaurant. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!restaurant) return;
    setVerifLoading(true);
    try {
      const res = await verificationAPI.create({ restaurantId: restaurant._id });
      setVerificationReq(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit verification request.');
    } finally {
      setVerifLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ padding: 16, background: '#FEE', color: 'var(--clr-error)', borderRadius: 'var(--r-md)' }}>{error}</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ maxWidth: 820, margin: '60px auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🍽️</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, margin: 0 }}>Create Your Restaurant Listing</h1>
          <p style={{ margin: '12px auto 0', maxWidth: 560, color: 'var(--clr-text-muted)', fontSize: 14 }}>
            Set up your restaurant after creating your owner account. Once the listing is created, submit it for admin verification so customers can see it.
          </p>
        </div>

        {error && (
          <div style={{ padding: 16, background: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--r-md)', marginBottom: 20 }}>
            {error}
          </div>
        )}

        {createMessage && (
          <div style={{ padding: 16, background: '#DCFCE7', color: '#166534', borderRadius: 'var(--r-md)', marginBottom: 20 }}>
            {createMessage}
          </div>
        )}

        <div style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--r-lg)', padding: 28 }}>
          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <label className="form-label">Restaurant Name</label>
              <input className="form-input" value={creationData.name} onChange={handleCreationChange('name')} placeholder="e.g. Star Kacchi House" />
            </div>

            <div>
              <label className="form-label">Address</label>
              <input className="form-input" value={creationData.address} onChange={handleCreationChange('address')} placeholder="e.g. Road 7, Dhanmondi" />
            </div>

            <div>
              <label className="form-label">Cuisine Types</label>
              <input className="form-input" value={creationData.cuisineTypesText} onChange={handleCreationChange('cuisineTypesText')} placeholder="e.g. Bangladeshi, BBQ, Street Food" />
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--clr-text-muted)' }}>Separate multiple cuisines with commas.</p>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={4} value={creationData.description} onChange={handleCreationChange('description')} placeholder="A short description of your restaurant." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={creationData.phone} onChange={handleCreationChange('phone')} placeholder="e.g. +880 1234 567890" />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" value={creationData.email} onChange={handleCreationChange('email')} placeholder="e.g. info@restaurant.com" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">City</label>
                <input className="form-input" value={creationData.city} onChange={handleCreationChange('city')} placeholder="e.g. Dhaka" />
              </div>
              <div>
                <label className="form-label">Website</label>
                <input className="form-input" value={creationData.website} onChange={handleCreationChange('website')} placeholder="Optional website URL" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Average Price</label>
                <input className="form-input" type="number" min="0" value={creationData.averagePrice} onChange={handleCreationChange('averagePrice')} placeholder="e.g. 450" />
              </div>
              <div>
                <label className="form-label">Price Range</label>
                <select className="form-input" value={creationData.priceRange} onChange={handleCreationChange('priceRange')}>
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                  <option value="$$$$">$$$$</option>
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCreateRestaurant}
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Create Restaurant Listing'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ca = restaurant.criteriaAverages || {};
  const criteriaKeys = ['taste', 'hygiene', 'service', 'ambience', 'value'];
  const ranked = criteriaKeys.map(k => ({ k, v: ca[k] || 0 })).filter(x => x.v > 0).sort((a,b) => b.v - a.v);
  const best  = ranked[0];
  const worst = ranked[ranked.length - 1];
  const totalReviews   = restaurant.reviewsCount || 0;
  const verifiedCount  = restaurant.verifiedReviewsCount || 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Restaurant name + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Owner Dashboard</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>{restaurant.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 4 }}>
            📍 {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
          </div>
          {!restaurant.isVerified && (
            <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 'var(--r-md)', background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', fontSize: 13 }}>
              Your restaurant is not yet verified. It will remain hidden from customers until an admin approves the listing.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {restaurant.isVerified && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#DCFCE7', color: '#16A34A', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              ✓ Verified Restaurant
            </span>
          )}
          <Link to="/owner/reviews" className="btn btn-primary btn-sm">Manage Reviews</Link>
          <Link to="/owner/dishes" className="btn btn-ghost btn-sm">Menu</Link>
        </div>
      </div>

      {/* ── Verification status ── */}
      {!restaurant.isVerified && (
        <div style={{
          background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)',
          padding: '18px 22px', marginBottom: 20,
          borderLeft: verificationReq?.status === 'pending' ? '4px solid #D97706'
            : verificationReq?.status === 'rejected' ? '4px solid #DC2626'
            : '4px solid var(--clr-border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                Restaurant Verification
              </div>
              {!verificationReq && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--clr-text-muted)' }}>
                    A <strong>FoodTabs Verified</strong> badge shows on your restaurant listing and increases customer trust.
                    Once approved, your restaurant and menu will appear in customer search results and recommendations.
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--clr-text-muted)', flexWrap: 'wrap' }}>
                    <span>✓ Verified badge on your profile</span>
                    <span>✓ Priority in search results</span>
                    <span>✓ Builds customer confidence</span>
                  </div>
                </div>
              )}
              {verificationReq?.status === 'pending' && (
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 13, color: '#D97706', fontWeight: 600 }}>
                    ⏳ Request submitted — admin review in progress.
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--clr-text-muted)' }}>
                    This usually takes 1–3 business days. You'll receive a notification with the result.
                  </p>
                </div>
              )}
              {verificationReq?.status === 'rejected' && (
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 13, color: '#DC2626', fontWeight: 600 }}>
                    ✗ Request not approved
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--clr-text-muted)' }}>
                    Reason: {verificationReq.rejectionReason || 'No reason provided. Please ensure your restaurant profile is complete before resubmitting.'}
                  </p>
                </div>
              )}
            </div>
            {!verificationReq && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRequestVerification}
                disabled={verifLoading}
              >
                {verifLoading ? 'Submitting…' : 'Request Verification'}
              </button>
            )}
            {verificationReq?.status === 'rejected' && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleRequestVerification}
                disabled={verifLoading}
              >
                {verifLoading ? 'Resubmitting…' : 'Resubmit Request'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── REVIEW PERFORMANCE (first, largest section) ── */}
      <div style={{
        background: 'white', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--clr-border)', padding: '24px', marginBottom: 20
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
          Review Performance
        </h2>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Overall score */}
          <div style={{ textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 60, fontWeight: 900, color: 'var(--clr-dark)', lineHeight: 1 }}>
              {restaurant.rating?.toFixed(1) || '—'}
            </div>
            <StarRating value={restaurant.rating} size="md" />
            <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>out of 5</div>
          </div>

          {/* Stats */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--clr-dark)' }}>{totalReviews}</div>
                <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Total Reviews</div>
              </div>
              {verifiedCount > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <VerifiedBadgeSVG size="md" />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#059669' }}>{verifiedCount}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Verified Visits</div>
                </div>
              )}
            </div>

            {/* Criteria bars */}
            {ranked.length > 0 && <CriteriaFullBars criteriaAverages={ca} />}

            {/* Insight */}
            {best && worst && best.k !== worst.k && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--clr-bg-alt)', borderRadius: 'var(--r-md)', fontSize: 13 }}>
                <span style={{ color: CRITERIA_COLORS[best.k], fontWeight: 700 }}>{CRITERIA_LABELS[best.k]}</span>
                {' '}is your highest rated criterion at {best.v}/5.{' '}
                <span style={{ color: CRITERIA_COLORS[worst.k], fontWeight: 700 }}>{CRITERIA_LABELS[worst.k]}</span>
                {' '}is your lowest at {worst.v}/5 — mentioned in{' '}
                {reviews.filter(rv => rv.ratings?.[worst.k] > 0).length} of {reviews.length} recent reviews.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dish stats ── */}
      {restaurant.dishes?.length > 0 && (
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '20px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Dish Ratings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {restaurant.dishes.filter(d => d.reviewsCount > 0).sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 6).map(dish => (
              <div key={dish._id} style={{ padding: '12px', background: 'var(--clr-bg-alt)', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{dish.name}</div>
                <div style={{ fontSize: 13, color: CRITERIA_COLORS.taste, fontWeight: 700 }}>
                  {dish.rating?.toFixed(1)} ★
                  <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400, marginLeft: 6, fontSize: 12 }}>
                    {dish.reviewsCount} review{dish.reviewsCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/owner/dishes" style={{ fontSize: 13, color: 'var(--clr-primary)', marginTop: 10, display: 'inline-block' }}>
            Manage all dishes →
          </Link>
        </div>
      )}

      {/* ── Booking Deposit Settings ── */}
      <DepositSettings
        restaurant={restaurant}
        onSaved={(val) => setRestaurant(r => ({ ...r, bookingDeposit: val }))}
      />

      {/* ── Quick action stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Manage Menu', icon: '🍽️', to: '/owner/dishes', color: 'var(--clr-primary)' },
          { label: 'View Bookings', icon: '📅', to: '/owner/bookings', color: '#2563EB' },
          { label: 'Read Reviews', icon: '⭐', to: '/owner/reviews', color: '#E8460B' },
          { label: 'Analytics', icon: '📊', to: '/owner/analytics', color: '#7C3AED' },
        ].map(action => (
          <Link
            key={action.to}
            to={action.to}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '20px', background: 'white', borderRadius: 'var(--r-lg)',
              border: `2px solid ${action.color}20`, textDecoration: 'none',
              color: action.color, textAlign: 'center', fontWeight: 700, fontSize: 14,
              gap: 8, transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = action.color; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = action.color; }}
          >
            <span style={{ fontSize: 24 }}>{action.icon}</span>
            {action.label}
          </Link>
        ))}
      </div>

      {/* ── Recent reviews ── */}
      {reviews.length > 0 && (
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, margin: 0 }}>Recent Reviews</h3>
            <Link to="/owner/reviews" style={{ fontSize: 13, color: 'var(--clr-primary)' }}>See all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.slice(0, 3).map(rv => <ReviewCard key={rv._id} review={rv} />)}
          </div>
        </div>
      )}
    </div>
  );
}
