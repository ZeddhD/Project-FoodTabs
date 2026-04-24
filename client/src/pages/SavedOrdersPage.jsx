import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/store.js';
import { savedOrderAPI, restaurantAPI, dishAPI } from '../services/api.js';

export default function SavedOrdersPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [savedOrders, setSavedOrders]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');

  // Create form state
  const [showCreate, setShowCreate]       = useState(false);
  const [restaurants, setRestaurants]     = useState([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  const [dishes, setDishes]               = useState([]);
  const [orderName, setOrderName]         = useState('');
  const [items, setItems]                 = useState([]); // [{dishId, name, price, quantity}]
  const [saving, setSaving]               = useState(false);

  useEffect(() => { fetchSavedOrders(); }, []);

  const fetchSavedOrders = async () => {
    try {
      setLoading(true);
      const res = await savedOrderAPI.getAll();
      setSavedOrders(res.data.data?.savedOrders || []);
    } catch (err) {
      setError('Failed to load saved orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this saved order?')) return;
    try {
      await savedOrderAPI.delete(orderId);
      setSavedOrders(savedOrders.filter(o => o._id !== orderId));
    } catch { setError('Failed to delete.'); }
  };

  // Create flow
  const openCreate = async () => {
    setShowCreate(true);
    setOrderName('');
    setSelectedRestId('');
    setDishes([]);
    setItems([]);
    if (restaurants.length === 0) {
      const res = await restaurantAPI.getAll({ limit: 50 });
      setRestaurants(res.data.data?.restaurants || res.data.data || []);
    }
  };

  const handleRestaurantSelect = async (restId) => {
    setSelectedRestId(restId);
    setItems([]);
    if (!restId) { setDishes([]); return; }
    const res = await dishAPI.getAll(restId);
    setDishes(res.data.data || []);
  };

  const addDish = (dish) => {
    setItems(prev => {
      const existing = prev.find(i => i.dishId === dish._id);
      if (existing) return prev.map(i => i.dishId === dish._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { dishId: dish._id, name: dish.name, price: dish.price, quantity: 1 }];
    });
  };

  const removeDish = (dishId) => setItems(prev => prev.filter(i => i.dishId !== dishId));

  const handleSaveOrder = async () => {
    if (!orderName.trim()) { alert('Give this order a name.'); return; }
    if (!selectedRestId)   { alert('Select a restaurant.'); return; }
    if (items.length === 0){ alert('Add at least one dish.'); return; }
    try {
      setSaving(true);
      const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
      await savedOrderAPI.create({
        name: orderName,
        restaurantId: selectedRestId,
        items: items.map(i => ({ dishId: i.dishId, quantity: i.quantity, price: i.price })),
        totalPrice,
      });
      setShowCreate(false);
      await fetchSavedOrders();
    } catch { setError('Failed to save order.'); }
    finally { setSaving(false); }
  };

  const filtered = savedOrders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.name?.toLowerCase().includes(q) ||
      o.restaurantId?.name?.toLowerCase().includes(q) ||
      o.items?.some(i => i.dishId?.name?.toLowerCase().includes(q))
    );
  });

  const formatDate = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7)   return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '32px var(--px) 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>My Usuals</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>Saved Orders</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clr-text-muted)' }}>Your favourite orders, ready to reorder in one tap.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Usual</button>
      </div>

      {error && <div style={{ padding: '12px 16px', background: '#FEE', color: 'var(--clr-error)', borderRadius: 'var(--r-md)', marginBottom: 16 }}>{error}</div>}

      {/* Create form */}
      {showCreate && (
        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '2px solid var(--clr-primary)', padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 16 }}>Create New Usual</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>ORDER NAME</label>
              <input
                className="form-input"
                placeholder="e.g. Friday Night, Work Lunch"
                value={orderName}
                onChange={e => setOrderName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 6 }}>RESTAURANT</label>
              <select
                className="form-input"
                value={selectedRestId}
                onChange={e => handleRestaurantSelect(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Select a restaurant…</option>
                {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          {/* Dish picker */}
          {selectedRestId && dishes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 8 }}>ADD DISHES</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                {dishes.map(dish => {
                  const inOrder = items.find(i => i.dishId === dish._id);
                  return (
                    <div key={dish._id} style={{
                      padding: '10px 12px', background: inOrder ? 'var(--clr-primary)' + '15' : 'var(--clr-bg-alt)',
                      borderRadius: 'var(--r-md)', border: `1px solid ${inOrder ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }} onClick={() => inOrder ? removeDish(dish._id) : addDish(dish)}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{dish.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>৳{dish.price}</div>
                      </div>
                      {inOrder ? (
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-primary)' }}>×{inOrder.quantity}</span>
                      ) : (
                        <span style={{ fontSize: 18, color: 'var(--clr-text-light)' }}>+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected items summary */}
          {items.length > 0 && (
            <div style={{ background: 'var(--clr-bg-alt)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 8 }}>ORDER SUMMARY</div>
              {items.map(i => (
                <div key={i.dishId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{i.name} × {i.quantity}</span>
                  <span style={{ fontWeight: 600 }}>৳{(i.price * i.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--clr-border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--clr-primary)' }}>৳{items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(0)}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleSaveOrder} disabled={saving}>{saving ? 'Saving…' : 'Save Usual'}</button>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      {savedOrders.length > 0 && (
        <div className="search-bar" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            type="text"
            className="search-bar__input"
            placeholder="Search saved orders…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && <button className="btn btn-ghost btn-sm" onClick={() => setSearchQuery('')}>✕</button>}
        </div>
      )}

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📝</div>
          <div className="empty-state__title">{savedOrders.length === 0 ? 'No saved orders yet' : 'No matches'}</div>
          <div className="empty-state__desc">
            {savedOrders.length === 0
              ? 'Create your first usual — a saved combination of dishes you order regularly.'
              : 'Try a different search term.'}
          </div>
          {savedOrders.length === 0 && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>Create Your First Usual</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(order => (
            <div key={order._id} style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-bg-alt)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--clr-primary), #FFB800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🍽️</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>{order.name}</div>
                    <Link to={`/restaurant/${order.restaurantId?._id}`} style={{ fontSize: 12, color: 'var(--clr-text-muted)', textDecoration: 'none' }}>
                      📍 {order.restaurantId?.name}
                    </Link>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--clr-primary)' }}>৳{order.totalPrice?.toFixed(0)}</div>
                  <div style={{ fontSize: 11, color: 'var(--clr-text-light)' }}>{formatDate(order.createdAt)}</div>
                </div>
              </div>

              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--clr-border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 8 }}>ITEMS ({order.items?.length})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {order.items?.map((item, idx) => (
                    <span key={idx} style={{ fontSize: 12, padding: '3px 10px', background: 'var(--clr-bg-alt)', borderRadius: 20, border: '1px solid var(--clr-border)' }}>
                      {item.dishId?.name || 'Dish'} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ padding: '12px 20px', display: 'flex', gap: 8 }}>
                <Link
                  to={`/restaurant/${order.restaurantId?._id}/book`}
                  className="btn btn-primary btn-sm"
                >
                  Book at {order.restaurantId?.name?.split(' ')[0]}
                </Link>
                <button
                  onClick={() => handleDeleteOrder(order._id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
