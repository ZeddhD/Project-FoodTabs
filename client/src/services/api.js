import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  logout: () => api.post('/auth/logout')
};

// Restaurant API calls
export const restaurantAPI = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
  getOwnerRestaurants: () => api.get('/restaurants/owner/my-restaurants')
};

// Dish API calls
export const dishAPI = {
  getAll: (restaurantId, params) => api.get(`/restaurants/${restaurantId}/dishes`, { params }),
  getById: (id) => api.get(`/restaurants/dishes/${id}`),
  create: (restaurantId, data) => api.post(`/restaurants/${restaurantId}/dishes`, data),
  update: (id, data) => api.put(`/restaurants/dishes/${id}`, data),
  delete: (id) => api.delete(`/restaurants/dishes/${id}`)
};

// Review API calls
export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  like: (id) => api.post(`/reviews/${id}/like`),
  unlike: (id) => api.post(`/reviews/${id}/unlike`)
};

// Favorite API calls
export const favoriteAPI = {
  getAll: (params) => api.get('/favorites', { params }),
  check: (params) => api.get('/favorites/check', { params }),
  add: (data) => api.post('/favorites', data),
  remove: (id) => api.delete(`/favorites/${id}`)
};

// Forum API calls
export const forumAPI = {
  // Posts
  getPosts: (params) => api.get('/forum/posts', { params }),
  getPost: (id) => api.get(`/forum/posts/${id}`),
  createPost: (data) => api.post('/forum/posts', data),
  updatePost: (id, data) => api.put(`/forum/posts/${id}`, data),
  deletePost: (id) => api.delete(`/forum/posts/${id}`),
  
  // Comments
  getComments: (postId, params) => api.get(`/forum/posts/${postId}/comments`, { params }),
  createComment: (postId, data) => api.post(`/forum/posts/${postId}/comments`, data),
  updateComment: (commentId, data) => api.put(`/forum/comments/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/forum/comments/${commentId}`),
  
  // Votes
  upvote: (postId) => api.post(`/votes/${postId}/upvote`),
  downvote: (postId) => api.post(`/votes/${postId}/downvote`),
  removeVote: (postId) => api.delete(`/votes/${postId}`),
  
  // Reports
  reportContent: (data) => api.post('/reports', data)
};

// Booking API calls
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.delete(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/user/my-bookings'),
  getRestaurantBookings: (restaurantId) => api.get(`/bookings/restaurant/${restaurantId}`)
};

// Payment API calls
export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  getPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}`)
};

// Event Booking API calls
export const eventBookingAPI = {
  getAll: (params) => api.get('/event-bookings', { params }),
  getById: (id) => api.get(`/event-bookings/${id}`),
  create: (data) => api.post('/event-bookings', data),
  update: (id, data) => api.put(`/event-bookings/${id}`, data),
  cancel: (id) => api.post(`/event-bookings/${id}/cancel`, {}),
  updateStatus: (id, status) => api.patch(`/event-bookings/${id}/status`, { status }),
  getRestaurantBookings: (restaurantId, params) => api.get(`/event-bookings/restaurant/${restaurantId}`, { params })
};

// Saved Orders API calls
export const savedOrderAPI = {
  getAll: (params) => api.get('/saved-orders', { params }),
  getById: (id) => api.get(`/saved-orders/${id}`),
  create: (data) => api.post('/saved-orders', data),
  update: (id, data) => api.put(`/saved-orders/${id}`, data),
  delete: (id) => api.delete(`/saved-orders/${id}`)
};

// Verification Request API calls
export const verificationAPI = {
  create: (data) => api.post('/verification-requests', data),
  getForRestaurant: (restaurantId) => api.get(`/verification-requests/restaurant/${restaurantId}`),
  resubmit: (restaurantId, data) => api.post(`/verification-requests/restaurant/${restaurantId}/resubmit`, data),
  getPending: (params) => api.get('/verification-requests/admin/pending', { params }),
  getAll: (params) => api.get('/verification-requests/admin/all', { params }),
  approve: (id, data) => api.patch(`/verification-requests/${id}/approve`, data),
  reject: (id, data) => api.patch(`/verification-requests/${id}/reject`, data)
};

// Recommendation API calls
export const recommendationAPI = {
  getSmartRecommendations: (params) => api.get('/recommendations/smart', { params }),
  getTrending: (params) => api.get('/recommendations/trending', { params }),
  getSimilarUsers: (params) => api.get('/recommendations/similar-users', { params }),
  getByPreferences: (params) => api.get('/recommendations', { params })
};

// Report API calls
export const reportAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.patch(`/reports/${id}`, data)
};

// User API calls (Admin - Manage users)
export const userAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  banUser: (id, data) => api.post(`/admin/users/${id}/ban`, data),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban`, {}),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

// Analytics API calls
export const analyticsAPI = {
  getRestaurantAnalytics: (restaurantId) => api.get(`/restaurants/${restaurantId}/analytics`)
};

export default api;
