import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './context/store';
import ProtectedRoute from './utils/ProtectedRoute';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RestaurantPage = lazy(() => import('./pages/RestaurantPage'));
const ReviewCreatePage = lazy(() => import('./pages/ReviewCreatePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));

// Phase 2 Pages (Forum)
const ForumPage = lazy(() => import('./pages/ForumPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));

// Phase 3 Pages (Bookings & Payments)
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingHistoryPage = lazy(() => import('./pages/BookingHistoryPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));

// Phase 4 Pages (Owner Features)
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const DishManagementPage = lazy(() => import('./pages/DishManagementPage'));
const OwnerBookingsPage = lazy(() => import('./pages/OwnerBookingsPage'));
const OwnerReviewsPage = lazy(() => import('./pages/OwnerReviewsPage'));

// Phase 5 Pages (Admin Features)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ReportsManagementPage = lazy(() => import('./pages/ReportsManagementPage'));
const VerificationQueuePage = lazy(() => import('./pages/VerificationQueuePage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));

// Phase 6 Pages (Additional Features)
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const SavedOrdersPage = lazy(() => import('./pages/SavedOrdersPage'));

// Remaining To-Do Pages
const EditPostPage = lazy(() => import('./pages/EditPostPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const OwnerAnalyticsPage = lazy(() => import('./pages/OwnerAnalyticsPage'));

// Phase 6 Components
import ChatbotWidget from './components/ChatbotWidget';
import NotificationsDropdown from './components/NotificationsDropdown';

export default function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <nav style={{
        background: '#2196F3',
        color: 'white',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontSize: '20px', 
          fontWeight: 'bold' 
        }}>
          🍽️ FoodReview
        </Link>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            Home
          </Link>
          
          <Link to="/forum" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            Forum
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/favorites" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Favorites
              </Link>
              <Link to="/bookings" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Bookings
              </Link>
              <Link to="/recommendations" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Recommendations
              </Link>
              <Link to="/saved-orders" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Saved Orders
              </Link>
              
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Profile
              </Link>
              
              {user?.role === 'owner' && (
                <>
                  <Link to="/owner/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                    👨‍💼 Owner Dashboard
                  </Link>
                  <Link to="/owner/analytics" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                    📊 Analytics
                  </Link>
                </>
              )}
              
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  👨‍💼 Admin Dashboard
                </Link>
              )}
              
              <NotificationsDropdown />
              
              <span style={{ fontSize: '14px' }}>
                👤 {user?.name || 'User'}
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  background: 'white',
                  color: '#2196F3',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                style={{ 
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Login
              </Link>
              <Link 
                to="/register"
                style={{
                  padding: '6px 12px',
                  background: 'white',
                  color: '#2196F3',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Routes */}
      <main style={{ flex: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '500px',
              fontSize: '18px',
              color: '#2196F3'
            }}>
              ⏳ Loading...
            </div>
          }>
            <Routes>
          {/* Phase 1 Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          
          <Route 
            path="/review/create" 
            element={
              <ProtectedRoute>
                <ReviewCreatePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } 
          />

          {/* Phase 2 Routes (Forum) */}
          <Route path="/forum" element={<ForumPage />} />
          
          <Route
            path="/forum/create"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/forum/:postId" element={<PostDetailPage />} />
          
          <Route
            path="/forum/:postId/edit"
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            }
          />

          {/* Phase 3 Routes (Bookings & Payments) */}
          <Route
            path="/restaurant/:restaurantId/book"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Phase 4 Routes (Owner Features) */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/dishes"
            element={
              <ProtectedRoute>
                <DishManagementPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute>
                <OwnerBookingsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/reviews"
            element={
              <ProtectedRoute>
                <OwnerReviewsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/analytics"
            element={
              <ProtectedRoute>
                <OwnerAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Phase 5 Routes (Admin Features) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <ReportsManagementPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/verification"
            element={
              <ProtectedRoute>
                <VerificationQueuePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Phase 6 Routes (Additional Features) */}
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <RecommendationsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/saved-orders"
            element={
              <ProtectedRoute>
                <SavedOrdersPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>

      {/* Chatbot Widget */}
      <ChatbotWidget />

      {/* Footer */}
      <footer style={{
        background: '#f5f5f5',
        padding: '24px',
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        color: '#666',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0 }}>
          © 2024 FoodReview Platform. Built with MERN Stack.
        </p>
      </footer>
    </div>
    </ErrorBoundary>
  );
}
