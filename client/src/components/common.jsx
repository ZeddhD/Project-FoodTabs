export const RestaurantCard = ({ restaurant, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        ':hover': { transform: 'scale(1.05)' }
      }}
    >
      <img 
        src={restaurant.coverImage || '/default-restaurant.jpg'} 
        alt={restaurant.name}
        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
      />
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{restaurant.name}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            ⭐ {restaurant.rating?.toFixed(1) || 'N/A'}
          </span>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {restaurant.reviewsCount} reviews
          </span>
        </div>
        <p style={{ color: '#999', fontSize: '12px', margin: '0' }}>
          {restaurant.cuisineTypes?.join(', ')}
        </p>
        <p style={{ color: '#999', fontSize: '12px', margin: '4px 0 0' }}>
          {restaurant.address}
        </p>
      </div>
    </div>
  );
};

export const DishCard = ({ dish, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <img 
          src={dish.images?.[0] || '/default-dish.jpg'}
          alt={dish.name}
          style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover' }}
        />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: '16px' }}>{dish.name}</h4>
          <p style={{ color: '#666', fontSize: '12px', margin: '0 0 8px' }}>
            {dish.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              ${dish.price?.toFixed(2)}
            </span>
            <span style={{ fontSize: '12px', color: '#666' }}>
              ⭐ {dish.rating?.toFixed(1) || 'New'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReviewCard = ({ review, onDelete }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <strong>{review.userId?.name}</strong>
            <span style={{ marginLeft: '12px', color: '#666', fontSize: '12px' }}>
              ⭐ {review.rating}/5
            </span>
            {review.isVerified && (
              <span style={{ marginLeft: '8px', color: '#4CAF50', fontSize: '12px', fontWeight: 'bold' }}>
                ✓ Verified
              </span>
            )}
          </div>
          <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>{review.title}</h4>
          <p style={{ color: '#555', margin: '0 0 8px', fontSize: '14px' }}>{review.content}</p>
          
          {review.ratings && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              <div>Taste: {review.ratings.taste}/5 | Hygiene: {review.ratings.hygiene}/5</div>
              <div>Service: {review.ratings.service}/5 | Ambience: {review.ratings.ambience}/5</div>
              <div>Value: {review.ratings.value}/5</div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
            <span>👍 {review.likeCount}</span>
          </div>
        </div>
        {onDelete && (
          <button 
            onClick={() => onDelete(review._id)}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export const SearchBar = ({ onSearch, onFilter }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <input 
          type="text"
          placeholder="Search restaurants..."
          onChange={(e) => onSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <button style={{
          padding: '10px 16px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Search
        </button>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <select 
          onChange={(e) => onFilter('cuisine', e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <option value="">All Cuisines</option>
          <option value="Chinese">Chinese</option>
          <option value="Indian">Indian</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
        </select>
        <select 
          onChange={(e) => onFilter('rating', e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <option value="">All Ratings</option>
          <option value="4.5">⭐ 4.5+</option>
          <option value="4">⭐ 4.0+</option>
          <option value="3.5">⭐ 3.5+</option>
        </select>
      </div>
    </div>
  );
};
