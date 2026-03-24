import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { reviewAPI, bookingAPI, restaurantAPI, dishAPI } from '../services/api';
import { VerifiedBadgeSVG } from '../components/common';
import PhotoUploadHelper from '../components/PhotoUploadHelper';

const CRITERIA = [
  { key: 'taste',    label: 'Taste',    color: 'var(--clr-taste)' },
  { key: 'hygiene',  label: 'Hygiene',  color: 'var(--clr-hygiene)' },
  { key: 'service',  label: 'Service',  color: 'var(--clr-service)' },
  { key: 'ambience', label: 'Ambience', color: 'var(--clr-ambience)' },
  { key: 'value',    label: 'Value',    color: 'var(--clr-value)' },
];
const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

function StarPicker({ value, onChange, color = 'var(--clr-star)', size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          style={{
            fontSize: size, cursor: 'pointer', lineHeight: 1,
            color: star <= (hover || value) ? color : 'var(--clr-border)',
            transition: 'color 0.1s, transform 0.1s',
            transform: star <= (hover || value) ? 'scale(1.15)' : 'scale(1)',
          }}
        >★</span>
      ))}
    </div>
  );
}

// Step 1: Dish selection
function DishSelectionStep({ dishes, selectedDishes, onToggle, onSkip }) {
  const categories = ['All', ...new Set(dishes.map(d => d.category).filter(Boolean))];
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? dishes : dishes.filter(d => d.category === cat);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>What did you eat?</h2>
      <p style={{ fontSize: 14, color: 'var(--clr-text-muted)', marginBottom: 20 }}>
        Select the dishes you tried. This helps future diners make better choices.
      </p>

      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                flexShrink: 0, padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: cat === c ? 'none' : '1px solid var(--clr-border)',
                background: cat === c ? 'var(--clr-primary)' : 'white',
                color: cat === c ? 'white' : 'var(--clr-text)',
                cursor: 'pointer'
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 24 }}>
        {filtered.map(dish => {
          const sel = selectedDishes.some(sd => sd.dishId === dish._id);
          return (
            <button
              key={dish._id}
              type="button"
              onClick={() => onToggle(dish)}
              style={{
                textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--r-md)',
                border: sel ? '2px solid var(--clr-primary)' : '1.5px solid var(--clr-border)',
                background: sel ? 'var(--clr-primary-light)' : 'white',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: sel ? 'var(--clr-primary)' : 'var(--clr-text)' }}>
                  {dish.name}
                </span>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--clr-primary)', flexShrink: 0 }}>
                  ৳{dish.price?.toFixed(0)}
                </span>
              </div>
              {dish.category && (
                <span style={{ fontSize: 11, color: 'var(--clr-text-light)' }}>{dish.category}</span>
              )}
              {sel && <span style={{ fontSize: 11, color: 'var(--clr-primary)', fontWeight: 600, display: 'block', marginTop: 4 }}>✓ Selected</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedDishes.length === 0}
          onClick={() => {/* parent advances step via canProceed check */}}
          style={{ opacity: selectedDishes.length === 0 ? 0.5 : 1 }}
          // The "Continue" button in the parent handles advancing
        >
          {selectedDishes.length === 0 ? 'Select at least one dish' : `Continue with ${selectedDishes.length} dish${selectedDishes.length !== 1 ? 'es' : ''}`}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onSkip} style={{ fontSize: 13 }}>
          Skip dish selection
        </button>
      </div>
    </div>
  );
}

// Step 2: Rate selected dishes
function DishRatingStep({ selectedDishes, onUpdateDish }) {
  if (!selectedDishes.length) return null;
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Rate each dish</h2>
      <p style={{ fontSize: 14, color: 'var(--clr-text-muted)', marginBottom: 20 }}>
        Give a quick score and optional comment for each dish you selected.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {selectedDishes.map(sd => (
          <div key={sd.dishId} style={{
            background: 'white', border: '1px solid var(--clr-border)',
            borderRadius: 'var(--r-md)', padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{sd.name}</span>
                <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--clr-primary)', fontWeight: 600 }}>৳{sd.price?.toFixed(0)}</span>
              </div>
              <StarPicker
                value={sd.rating}
                onChange={val => onUpdateDish(sd.dishId, 'rating', val)}
                color="var(--clr-taste)"
                size={24}
              />
            </div>
            {sd.rating > 0 && (
              <input
                type="text"
                className="form-input"
                placeholder={`Quick note on ${sd.name} (optional)`}
                value={sd.comment}
                onChange={e => onUpdateDish(sd.dishId, 'comment', e.target.value)}
                maxLength={200}
                style={{ fontSize: 13 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReviewCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const preselectedDishId = searchParams.get('dishId');

  const [step, setStep]             = useState(1); // 1=dishes, 2=dish ratings, 3=restaurant rating
  const [restaurant, setRestaurant] = useState(null);
  const [allDishes, setAllDishes]   = useState([]);
  const [hasVerifiedBooking, setHasVerifiedBooking] = useState(false);

  // Dish selections: [{ dishId, name, price, rating, comment }]
  const [selectedDishes, setSelectedDishes] = useState([]);

  const [formData, setFormData] = useState({
    title: '', content: '', rating: 0,
    ratings: { taste: 0, hygiene: 0, service: 0, ambience: 0, value: 0 },
  });
  const [photos, setPhotos]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [skippedDishes, setSkippedDishes] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    restaurantAPI.getById(restaurantId)
      .then(res => {
        if (res.data.success) {
          setRestaurant(res.data.data.restaurant);
          const dishList = res.data.data.dishes || [];
          setAllDishes(dishList);
          // Pre-select dish from URL param
          if (preselectedDishId) {
            const dish = dishList.find(d => d._id === preselectedDishId);
            if (dish) setSelectedDishes([{ dishId: dish._id, name: dish.name, price: dish.price, rating: 0, comment: '' }]);
          }
        }
      })
      .catch(() => {});

    bookingAPI.getAll()
      .then(res => {
        if (res.data.success) {
          const bookings = res.data.data?.bookings || res.data.data || [];
          const verified = bookings.some(b =>
            (b.restaurantId?._id === restaurantId || b.restaurantId === restaurantId) &&
            b.status === 'completed'
          );
          setHasVerifiedBooking(verified);
        }
      })
      .catch(() => {});
  }, [restaurantId]);

  const toggleDish = (dish) => {
    setSelectedDishes(prev => {
      const exists = prev.some(sd => sd.dishId === dish._id);
      if (exists) return prev.filter(sd => sd.dishId !== dish._id);
      return [...prev, { dishId: dish._id, name: dish.name, price: dish.price, rating: 0, comment: '' }];
    });
  };

  const updateDish = (dishId, field, value) => {
    setSelectedDishes(prev => prev.map(sd => sd.dishId === dishId ? { ...sd, [field]: value } : sd));
  };

  const handleSkipDishes = () => {
    setSkippedDishes(true);
    setStep(3);
  };

  const handleDishStepContinue = () => {
    if (selectedDishes.length === 0) return;
    setStep(2);
  };

  const handleDishRatingContinue = () => {
    const unrated = selectedDishes.filter(sd => sd.rating === 0);
    if (unrated.length > 0) {
      setError(`Please rate: ${unrated.map(sd => sd.name).join(', ')}`);
      return;
    }
    setError('');
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.rating)        { setError('Please select an overall rating.'); return; }
    if (!formData.title.trim())  { setError('Please add a title for your review.'); return; }
    if (!formData.content.trim()){ setError('Please write your review.'); return; }

    setLoading(true);
    try {
      const payload = {
        title:       formData.title,
        content:     formData.content,
        rating:      formData.rating,
        ratings:     formData.ratings,
        restaurantId,
        dishReviews: selectedDishes
          .filter(sd => sd.rating > 0)
          .map(sd => ({ dishId: sd.dishId, rating: sd.rating, comment: sd.comment || undefined })),
      };

      const data = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          data.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
        }
      });
      photos.forEach(photo => data.append('photos', photo));

      const res = await reviewAPI.create(data);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate(restaurantId ? `/restaurant/${restaurantId}` : '/'), 1800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page" style={{ maxWidth: 600, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 12 }}>Review Submitted!</h1>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: 16 }}>Thanks for sharing your experience. Redirecting you back...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      {/* Back link */}
      <Link
        to={restaurantId ? `/restaurant/${restaurantId}` : '/'}
        style={{ fontSize: 13, color: 'var(--clr-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}
      >
        ← Back{restaurant ? ` to ${restaurant.name}` : ''}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, marginBottom: 6 }}>
        Write a Review
      </h1>
      {restaurant && (
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: 20 }}>
          Reviewing <strong>{restaurant.name}</strong>
        </p>
      )}

      {/* Verified banner */}
      {hasVerifiedBooking && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          background: 'rgba(16,185,129,0.08)', border: '1.5px solid #10B981',
          borderRadius: 'var(--r-lg)', marginBottom: 24
        }}>
          <VerifiedBadgeSVG size="lg" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>
              You'll earn a Verified Visit badge
            </div>
            <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>
              You have a completed booking here — your review will be marked as a verified visit automatically.
            </div>
          </div>
        </div>
      )}

      {/* Step indicator */}
      {!skippedDishes && allDishes.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
          {[
            { n: 1, label: 'Dishes' },
            { n: 2, label: 'Dish Ratings' },
            { n: 3, label: 'Your Review' },
          ].map(({ n, label }, i, arr) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  background: step >= n ? 'var(--clr-primary)' : 'var(--clr-border)',
                  color: step >= n ? 'white' : 'var(--clr-text-light)',
                }}>
                  {step > n ? '✓' : n}
                </div>
                <span style={{ fontSize: 13, fontWeight: step === n ? 700 : 400, color: step === n ? 'var(--clr-text)' : 'var(--clr-text-light)' }}>
                  {label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 24, height: 2, background: step > n ? 'var(--clr-primary)' : 'var(--clr-border)' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      {/* ── Step 1: Dish selection ── */}
      {step === 1 && allDishes.length > 0 && (
        <div>
          <DishSelectionStep
            dishes={allDishes}
            selectedDishes={selectedDishes}
            onToggle={toggleDish}
            onSkip={handleSkipDishes}
          />
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedDishes.length === 0}
              onClick={handleDishStepContinue}
            >
              Continue →
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleSkipDishes} style={{ marginLeft: 12, fontSize: 13 }}>
              Skip dish selection
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Dish ratings ── */}
      {step === 2 && (
        <div>
          <DishRatingStep selectedDishes={selectedDishes} onUpdateDish={updateDish} />
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button type="button" className="btn btn-primary" onClick={handleDishRatingContinue}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Restaurant review form ── */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          {!skippedDishes && selectedDishes.length > 0 && (
            <div style={{
              background: 'var(--clr-bg-alt)', borderRadius: 'var(--r-md)',
              padding: '12px 16px', marginBottom: 20, fontSize: 13
            }}>
              <span style={{ fontWeight: 600 }}>Reviewing dishes: </span>
              {selectedDishes.map(sd => (
                <span key={sd.dishId} style={{ marginLeft: 6 }}>
                  {sd.name} {sd.rating > 0 && <span style={{ color: 'var(--clr-taste)', fontWeight: 700 }}>{sd.rating}★</span>}
                </span>
              ))}
              <button type="button" onClick={() => setStep(2)} style={{ marginLeft: 12, fontSize: 12, color: 'var(--clr-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Edit
              </button>
            </div>
          )}

          {/* Overall Rating */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Overall Rating</h2>
                {formData.rating > 0 && (
                  <span style={{ padding: '4px 14px', borderRadius: 'var(--r-full)', background: 'var(--clr-primary-light)', color: 'var(--clr-primary)', fontSize: 13, fontWeight: 700 }}>
                    {LABELS[formData.rating]}
                  </span>
                )}
              </div>
              <StarPicker value={formData.rating} onChange={v => setFormData(p => ({ ...p, rating: v }))} size={38} />
              {!formData.rating && <p style={{ fontSize: 12, color: 'var(--clr-text-light)', marginTop: 8 }}>Tap a star to rate</p>}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Rate by Category</h2>
              <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 16 }}>Help others understand different aspects of the experience</p>
              {CRITERIA.map(({ key, label, color }) => (
                <div key={key} className="rating-category-row">
                  <div className="rating-category-label">
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, marginRight: 8, flexShrink: 0 }} />
                    {label}
                  </div>
                  <StarPicker value={formData.ratings[key]} onChange={val => setFormData(p => ({ ...p, ratings: { ...p.ratings, [key]: val } }))} color={color} size={22} />
                  {formData.ratings[key] > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginLeft: 8, minWidth: 56 }}>
                      {LABELS[formData.ratings[key]]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Add Photos</h2>
              <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 16 }}>Show others what to expect — photos get 2× more engagement.</p>
              <PhotoUploadHelper onPhotosSelected={setPhotos} maxPhotos={5} />
            </div>
          </div>

          {/* Review text */}
          <div className="card" style={{ marginBottom: 28 }}>
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Review</h2>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Sum up your experience in one line"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  maxLength={120}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Your Experience
                  <span style={{ float: 'right', fontWeight: 400, color: 'var(--clr-text-light)' }}>
                    {formData.content.length}/1000
                  </span>
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="What did you order? What stood out? Any tips for future visitors..."
                  value={formData.content}
                  onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                  maxLength={1000}
                  style={{ minHeight: 140 }}
                />
              </div>
            </div>
          </div>

          {!skippedDishes && allDishes.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)} style={{ marginRight: 12 }}>
              ← Back
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ minWidth: 200 }}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--clr-text-light)', marginTop: 12 }}>
            Your review will be posted publicly under your username.
          </p>
        </form>
      )}

      {/* If no restaurant or no dishes, skip straight to step 3 */}
      {step === 1 && allDishes.length === 0 && (
        <form onSubmit={handleSubmit}>
          {/* Same as step 3 but triggered directly */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Overall Rating</h2>
                {formData.rating > 0 && (
                  <span style={{ padding: '4px 14px', borderRadius: 'var(--r-full)', background: 'var(--clr-primary-light)', color: 'var(--clr-primary)', fontSize: 13, fontWeight: 700 }}>
                    {LABELS[formData.rating]}
                  </span>
                )}
              </div>
              <StarPicker value={formData.rating} onChange={v => setFormData(p => ({ ...p, rating: v }))} size={38} />
            </div>
          </div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Rate by Category</h2>
              {CRITERIA.map(({ key, label, color }) => (
                <div key={key} className="rating-category-row">
                  <div className="rating-category-label">
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, marginRight: 8 }} />
                    {label}
                  </div>
                  <StarPicker value={formData.ratings[key]} onChange={val => setFormData(p => ({ ...p, ratings: { ...p.ratings, [key]: val } }))} color={color} size={22} />
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Add Photos</h2>
              <PhotoUploadHelper onPhotosSelected={setPhotos} maxPhotos={5} />
            </div>
          </div>
          <div className="card" style={{ marginBottom: 28 }}>
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Review</h2>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" placeholder="Sum up your experience" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} maxLength={120} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Experience</label>
                <textarea className="form-textarea" placeholder="What did you order? What stood out?" value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))} maxLength={1000} style={{ minHeight: 140 }} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
}
