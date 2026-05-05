import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, eventBookingAPI } from '../services/api';

const EVENT_TYPES = ['Birthday', 'Wedding', 'Corporate', 'Anniversary', 'Celebration', 'Conference', 'Other'];

const labelStyle = { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--clr-dark)' };

export default function EventBookingPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);

  const [formData, setFormData] = useState({
    eventName:           '',
    eventType:           'Birthday',
    eventDate:           '',
    eventTime:           '18:00',
    duration:            120,
    guestCount:          10,
    estimatedBudget:     '',
    description:         '',
    specialRequirements: ''
  });

  useEffect(() => {
    if (restaurantId) fetchRestaurant();
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const res = await restaurantAPI.getById(restaurantId);
      setRestaurant(res.data.data?.restaurant || res.data.data);
    } catch {
      setError('Failed to load restaurant details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['guestCount', 'duration', 'estimatedBudget'].includes(name)
        ? (parseInt(value) || value)
        : value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName || !formData.eventDate || !formData.guestCount) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const res = await eventBookingAPI.create({ restaurantId, ...formData });
      const booking = res.data.data;
      setSuccess(true);
      setTimeout(() => navigate(`/event-bookings/${booking._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ padding: '14px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
        <button onClick={() => navigate('/')} className="btn btn-primary btn-sm">Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Header */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Event Booking
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>
          Plan Your Event at {restaurant?.name}
        </h1>
        {restaurant?.address && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>
            📍 {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
          </p>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '14px 16px', background: '#DCFCE7', color: '#16A34A', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
          ✓ Event booking created! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>

        {/* Event Name */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>
            Event Name <span style={{ color: 'var(--clr-primary)' }}>*</span>
          </label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Sarah's Birthday Party"
            disabled={submitting}
          />
        </div>

        {/* Event Type */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Event Type</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="filter-select"
            style={{ width: '100%', padding: '10px 12px' }}
            disabled={submitting}
          >
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Date & Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Event Date <span style={{ color: 'var(--clr-primary)' }}>*</span></label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="form-input"
              disabled={submitting}
            />
          </div>
          <div>
            <label style={labelStyle}>Event Time <span style={{ color: 'var(--clr-primary)' }}>*</span></label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              className="form-input"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Guests & Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Number of Guests <span style={{ color: 'var(--clr-primary)' }}>*</span></label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              min="1" max="500"
              className="form-input"
              disabled={submitting}
            />
          </div>
          <div>
            <label style={labelStyle}>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="30" max="480" step="30"
              className="form-input"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Estimated Budget (৳)</label>
          <input
            type="number"
            name="estimatedBudget"
            value={formData.estimatedBudget}
            onChange={handleChange}
            min="0"
            placeholder="Total budget for the event"
            className="form-input"
            disabled={submitting}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Event Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            rows={3}
            style={{ resize: 'vertical' }}
            placeholder="Tell us about your event…"
            disabled={submitting}
          />
        </div>

        {/* Special Requirements */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Special Requirements</label>
          <textarea
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
            className="form-input"
            rows={3}
            style={{ resize: 'vertical' }}
            placeholder="Decorations, dietary restrictions, AV equipment…"
            disabled={submitting}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate(-1)} disabled={submitting} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={submitting || success} className="btn btn-primary">
            {submitting ? 'Submitting…' : 'Request Event Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
