import { useState, useEffect } from 'react';
import { restaurantAPI, dishAPI } from '../services/api';
import DishForm from '../components/DishForm';

const CATEGORY_ICONS = {
  'Appetizer': '🥗', 'Starter': '🥗', 'Main': '🍽️', 'Main Course': '🍽️',
  'Dessert': '🍰', 'Beverage': '🥤', 'Drink': '🥤', 'Side': '🥙',
  'Side Dish': '🥙', 'Seafood': '🦞', 'Grill': '🔥', 'BBQ': '🔥',
  'Soup': '🍜', 'Salad': '🥗', 'Pizza': '🍕', 'Burger': '🍔',
  'Pasta': '🍝', 'Rice': '🍚', 'Bread': '🍞', 'Sandwich': '🥪',
};

function DishImagePlaceholder({ dish }) {
  const icon = CATEGORY_ICONS[dish.category] || '🍽️';
  const initial = (dish.name || 'D')[0].toUpperCase();
  return (
    <div style={{
      width: '100%', height: 160,
      background: 'linear-gradient(135deg, var(--clr-primary-light) 0%, #FFF3EC 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6
    }}>
      <span style={{ fontSize: 36 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.05em' }}>
        {initial}
      </span>
    </div>
  );
}

export default function DishManagementPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const restaurantResponse = await restaurantAPI.getOwnerRestaurants();
      if (restaurantResponse.data.data?.length > 0) {
        const rest = restaurantResponse.data.data[0];
        setRestaurant(rest);
        const dishesResponse = await dishAPI.getAll(rest._id, { limit: 100 });
        setDishes(dishesResponse.data.data || []);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load dishes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Delete this dish?')) return;
    try {
      await dishAPI.delete(dishId);
      setDishes(dishes.filter(d => d._id !== dishId));
    } catch {
      alert('Failed to delete dish. Please try again.');
    }
  };

  const handleFormSuccess = (savedDish) => {
    if (editingDish) {
      setDishes(dishes.map(d => d._id === savedDish._id ? savedDish : d));
    } else {
      setDishes([savedDish, ...dishes]);
    }
    setShowForm(false);
    setEditingDish(null);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🍽️</div>
        <div className="empty-state__title">No restaurant found</div>
        <div className="empty-state__desc">Your account doesn't have a restaurant linked yet.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Menu Management
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>
            {restaurant.name}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 4 }}>
            {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'} on the menu
          </div>
        </div>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => { setEditingDish(null); setShowForm(true); }}
          >
            + Add Dish
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: 16, background: '#FEE', color: 'var(--clr-error)', borderRadius: 'var(--r-md)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{
          background: 'white', borderRadius: 'var(--r-lg)',
          border: '1px solid var(--clr-border)', padding: 24, marginBottom: 28
        }}>
          <DishForm
            restaurantId={restaurant._id}
            dish={editingDish}
            onSuccess={handleFormSuccess}
            onCancel={() => { setShowForm(false); setEditingDish(null); }}
          />
        </div>
      )}

      {/* Dish Grid */}
      {dishes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {dishes.map(dish => (
            <div
              key={dish._id}
              style={{
                background: 'white', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--clr-border)', overflow: 'hidden',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Image or placeholder */}
              {dish.image ? (
                <img
                  src={dish.image}
                  alt={dish.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover' }}
                />
              ) : (
                <DishImagePlaceholder dish={dish} />
              )}

              {/* Info */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, margin: 0, flex: 1, paddingRight: 8 }}>
                    {dish.name}
                  </h3>
                  {/* Available toggle indicator — only show if explicitly unavailable */}
                  {dish.isAvailable === false && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px',
                      borderRadius: 20, background: '#FEE2E2', color: '#DC2626',
                      flexShrink: 0, whiteSpace: 'nowrap'
                    }}>
                      Unavailable
                    </span>
                  )}
                </div>

                {dish.category && (
                  <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', marginBottom: 6 }}>
                    {CATEGORY_ICONS[dish.category] || '•'} {dish.category}
                  </div>
                )}

                {dish.description && (
                  <p style={{
                    fontSize: 12, color: 'var(--clr-text-muted)', lineHeight: 1.5,
                    margin: '0 0 10px',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {dish.description}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--clr-primary)' }}>
                    ৳{dish.price?.toFixed(2)}
                  </span>
                  {dish.rating > 0 && (
                    <span style={{ fontSize: 12, color: '#E8460B', fontWeight: 700 }}>
                      {dish.rating.toFixed(1)} ★
                      {dish.reviewsCount > 0 && (
                        <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400 }}>
                          {' '}({dish.reviewsCount})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => { setEditingDish(dish); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleDeleteDish(dish._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🍽️</div>
          <div className="empty-state__title">No dishes yet</div>
          <div className="empty-state__desc">Add your first dish to start building your menu.</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditingDish(null); setShowForm(true); }}>
            + Add Your First Dish
          </button>
        </div>
      )}
    </div>
  );
}
