import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (user, token) => {
    localStorage.setItem('token', token);
    const normalized = { ...user, _id: user._id || user.userId };
    set({ user: normalized, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  getToken: () => localStorage.getItem('token')
}));

export const useRestaurantStore = create((set) => ({
  restaurants: [],
  selectedRestaurant: null,
  filters: {},

  setRestaurants: (restaurants) => set({ restaurants }),
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
  setFilters: (filters) => set({ filters })
}));

export const useFavoriteStore = create((set) => ({
  favorites: [],
  setFavorites: (favorites) => set({ favorites }),
  addFavorite: (item) => set((state) => ({ 
    favorites: [...state.favorites, item] 
  })),
  removeFavorite: (id) => set((state) => ({ 
    favorites: state.favorites.filter(f => f._id !== id) 
  }))
}));

export const useForumStore = create((set) => ({
  posts: [],
  selectedPost: null,
  comments: [],
  searchQuery: '',
  selectedCategory: '',

  setPosts: (posts) => set({ posts }),
  setSelectedPost: (post) => set({ selectedPost: post }),
  setComments: (comments) => set({ comments }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (id, updatedPost) => set((state) => ({
    posts: state.posts.map(p => p._id === id ? updatedPost : p),
    selectedPost: state.selectedPost?._id === id ? updatedPost : state.selectedPost
  })),
  deletePost: (id) => set((state) => ({
    posts: state.posts.filter(p => p._id !== id)
  })),
  addComment: (comment) => set((state) => ({
    comments: [...state.comments, comment]
  })),
  updateComment: (id, updatedComment) => set((state) => ({
    comments: state.comments.map(c => c._id === id ? updatedComment : c)
  })),
  deleteComment: (id) => set((state) => ({
    comments: state.comments.filter(c => c._id !== id)
  }))
}));

export const useBookingStore = create((set) => ({
  bookings: [],
  selectedBooking: null,
  paymentIntent: null,

  setBookings: (bookings) => set({ bookings }),
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  setPaymentIntent: (paymentIntent) => set({ paymentIntent }),
  addBooking: (booking) => set((state) => ({
    bookings: [booking, ...state.bookings]
  })),
  updateBooking: (id, updatedBooking) => set((state) => ({
    bookings: state.bookings.map(b => b._id === id ? updatedBooking : b),
    selectedBooking: state.selectedBooking?._id === id ? updatedBooking : state.selectedBooking
  })),
  cancelBooking: (id) => set((state) => ({
    bookings: state.bookings.filter(b => b._id !== id)
  }))
}));
