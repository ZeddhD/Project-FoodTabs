import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './context/store';
import ProtectedRoute from './utils/ProtectedRoute';
import { Suspense, lazy, useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { authAPI } from './services/api';

// Lazy load pages
const HomePage            = lazy(() => import('./pages/HomePage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/RegisterPage'));
const RestaurantPage      = lazy(() => import('./pages/RestaurantPage'));
const ReviewCreatePage    = lazy(() => import('./pages/ReviewCreatePage'));
const ReviewsFeedPage     = lazy(() => import('./pages/ReviewsFeedPage'));
const FavoritesPage       = lazy(() => import('./pages/FavoritesPage'));
const ForumPage           = lazy(() => import('./pages/ForumPage'));
const PostDetailPage      = lazy(() => import('./pages/PostDetailPage'));
const CreatePostPage      = lazy(() => import('./pages/CreatePostPage'));
const EditPostPage        = lazy(() => import('./pages/EditPostPage'));
const BookingPage         = lazy(() => import('./pages/BookingPage'));
const BookingHistoryPage  = lazy(() => import('./pages/BookingHistoryPage'));
const PaymentPage         = lazy(() => import('./pages/PaymentPage'));
const EventBookingPage    = lazy(() => import('./pages/EventBookingPage'));
const OwnerDashboard      = lazy(() => import('./pages/OwnerDashboard'));
const DishManagementPage  = lazy(() => import('./pages/DishManagementPage'));
const OwnerBookingsPage   = lazy(() => import('./pages/OwnerBookingsPage'));
const OwnerReviewsPage    = lazy(() => import('./pages/OwnerReviewsPage'));
const OwnerAnalyticsPage  = lazy(() => import('./pages/OwnerAnalyticsPage'));
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard'));
const ReportsManagementPage   = lazy(() => import('./pages/ReportsManagementPage'));
const VerificationQueuePage   = lazy(() => import('./pages/VerificationQueuePage'));
const UserManagementPage      = lazy(() => import('./pages/UserManagementPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const SavedOrdersPage     = lazy(() => import('./pages/SavedOrdersPage'));
const UserProfilePage     = lazy(() => import('./pages/UserProfilePage'));
const DishPage            = lazy(() => import('./pages/DishPage'));

import ChatbotWidget         from './components/ChatbotWidget';
import NotificationsDropdown from './components/NotificationsDropdown';
import logoSvg from './assets/Gemini_Generated_Image_ql80aeql80aeql80.png';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <img src={logoSvg} alt="FoodTabs logo" style={{ width: 34, height: 34, flexShrink: 0 }} />
          <span>Food</span>Tabs
        </Link>

        {/* Main Links — role-specific */}
        <div className="navbar__links">
          {/* Public nav — always visible */}
          {(!isAuthenticated || user?.role === 'customer') && (
            <>
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Discover
              </NavLink>
              <NavLink to="/reviews" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Reviews
              </NavLink>
            </>
          )}
          {/* Community — signed-in customers only */}
          {isAuthenticated && user?.role === 'customer' && (
            <NavLink to="/forum" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Community
            </NavLink>
          )}

          {/* Owner nav */}
          {isAuthenticated && user?.role === 'owner' && (
            <>
              <NavLink to="/owner/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/owner/dishes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Menu
              </NavLink>
              <NavLink to="/owner/bookings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Bookings
              </NavLink>
              <NavLink to="/owner/reviews" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Reviews
              </NavLink>
              <NavLink to="/owner/analytics" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Analytics
              </NavLink>
            </>
          )}

          {/* Admin nav */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Users
              </NavLink>
              <NavLink to="/admin/reports" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Reports
              </NavLink>
              <NavLink to="/admin/verification" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Verification
              </NavLink>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="navbar__right">
          {isAuthenticated ? (
            <>
              <NotificationsDropdown />
              <div style={{ position: 'relative' }}>
                <button
                  className="navbar__user"
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E8460B, #FFB800)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
                  }}>
                    {(user?.name || 'U')[0].toUpperCase()}
                  </span>
                  {user?.name?.split(' ')[0] || 'Account'}
                  <span style={{ fontSize: 10, color: 'var(--clr-text-light)' }}>▾</span>
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'white', borderRadius: 'var(--r-md)',
                    border: '1px solid var(--clr-border)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: 200, overflow: 'hidden', zIndex: 200
                  }}>
                    {/* Customer dropdown items */}
                    {user?.role === 'customer' && (
                      <>
                        <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          My Profile
                        </Link>
                        <Link to="/bookings" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          My Bookings
                        </Link>
                        <Link to="/favorites" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Favourites
                        </Link>
                        <Link to="/recommendations" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          For You
                        </Link>
                        <Link to="/saved-orders" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          My Usuals
                        </Link>
                      </>
                    )}

                    {/* Owner dropdown items */}
                    {user?.role === 'owner' && (
                      <>
                        <Link to="/owner/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Dashboard
                        </Link>
                        <Link to="/owner/dishes" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Menu Management
                        </Link>
                        <Link to="/owner/bookings" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Bookings
                        </Link>
                        <Link to="/owner/reviews" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Reviews
                        </Link>
                        <Link to="/owner/analytics" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Analytics
                        </Link>
                      </>
                    )}

                    {/* Admin dropdown items */}
                    {user?.role === 'admin' && (
                      <>
                        <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Admin Dashboard
                        </Link>
                        <Link to="/admin/users" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          User Management
                        </Link>
                        <Link to="/admin/reports" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Reports
                        </Link>
                        <Link to="/admin/verification" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, fontWeight: 500, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)' }}>
                          Verification Queue
                        </Link>
                      </>
                    )}

                    <button onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '11px 16px', fontSize: 14, fontWeight: 600, color: 'var(--clr-error)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
      {/* Click outside closes menu */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
      )}
    </nav>
  );
}

function UserQuickNav() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role === 'admin' || user?.role === 'owner') return null;

  return (
    <div style={{
      position: 'sticky',
      top: 'var(--nav-h)',
      zIndex: 99,
      background: 'white',
      borderBottom: '1px solid var(--clr-border)',
      boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
    }}>
      <div style={{
        maxWidth: 'var(--max-w)',
        margin: '0 auto',
        padding: '0 var(--px)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: 42,
        overflowX: 'auto',
      }}>
        <NavLink to="/favorites"       className={({ isActive }) => `user-nav-link${isActive ? ' active' : ''}`}>♡ Favourites</NavLink>
        <NavLink to="/recommendations" className={({ isActive }) => `user-nav-link${isActive ? ' active' : ''}`}>✦ For You</NavLink>
        <NavLink to="/saved-orders"    className={({ isActive }) => `user-nav-link${isActive ? ' active' : ''}`}>⊞ My Usuals</NavLink>
        <NavLink to="/bookings"        className={({ isActive }) => `user-nav-link${isActive ? ' active' : ''}`}>📅 Bookings</NavLink>
        <NavLink to="/profile"         className={({ isActive }) => `user-nav-link${isActive ? ' active' : ''}`}>◉ Profile</NavLink>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading...</span>
    </div>
  );
}

// Redirects admin/owner to their home when visiting "/"
function RoleHome() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (isAuthenticated && user?.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
  return <HomePage />;
}

function AuthInit() {
  const { token, setUser, logout } = useAuthStore();
  const [banned, setBanned] = useState(null);

  useEffect(() => {
    if (!token) return;
    authAPI.getProfile()
      .then(res => { if (res.data?.success && res.data?.data) setUser(res.data.data); })
      .catch(err => {
        if (err.response?.status === 403) {
          setBanned(err.response.data?.message || 'Your account has been suspended.');
          logout();
        } else {
          logout(); // invalid/expired token
        }
      });
  }, []);

  if (banned) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'white', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, marginBottom: 8, color: 'var(--clr-dark)' }}>Account Suspended</h2>
        <p style={{ fontSize: 14, color: 'var(--clr-text-muted)', textAlign: 'center', maxWidth: 400, marginBottom: 24 }}>{banned}</p>
        <p style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>If you believe this is a mistake, please contact support.</p>
      </div>
    );
  }

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthInit />
      <Navbar />
      <UserQuickNav />

      <main style={{ flex: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public / Customer-facing */}
              <Route path="/"              element={<RoleHome />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/register"      element={<RegisterPage />} />
              <Route path="/restaurant/:id" element={<RestaurantPage />} />
              <Route path="/dish/:dishId"  element={<DishPage />} />
              <Route path="/reviews"       element={<ReviewsFeedPage />} />
              <Route path="/forum"         element={<ForumPage />} />
              <Route path="/forum/:postId" element={<PostDetailPage />} />

              {/* Protected — customer only */}
              <Route path="/review/create" element={<ProtectedRoute customerOnly><ReviewCreatePage /></ProtectedRoute>} />
              <Route path="/favorites"     element={<ProtectedRoute customerOnly><FavoritesPage /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute customerOnly><RecommendationsPage /></ProtectedRoute>} />
              <Route path="/saved-orders"  element={<ProtectedRoute customerOnly><SavedOrdersPage /></ProtectedRoute>} />
              <Route path="/profile"       element={<ProtectedRoute customerOnly><UserProfilePage /></ProtectedRoute>} />
              <Route path="/bookings"      element={<ProtectedRoute customerOnly><BookingHistoryPage /></ProtectedRoute>} />

              <Route path="/forum/create"       element={<ProtectedRoute customerOnly><CreatePostPage /></ProtectedRoute>} />
              <Route path="/forum/:postId/edit" element={<ProtectedRoute customerOnly><EditPostPage /></ProtectedRoute>} />

              <Route path="/restaurant/:restaurantId/book"  element={<ProtectedRoute customerOnly><BookingPage /></ProtectedRoute>} />
              <Route path="/restaurant/:restaurantId/event" element={<ProtectedRoute customerOnly><EventBookingPage /></ProtectedRoute>} />
              <Route path="/payment/:bookingId"             element={<ProtectedRoute customerOnly><PaymentPage /></ProtectedRoute>} />

              {/* Owner */}
              <Route path="/owner/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
              <Route path="/owner/dishes"    element={<ProtectedRoute><DishManagementPage /></ProtectedRoute>} />
              <Route path="/owner/bookings"  element={<ProtectedRoute><OwnerBookingsPage /></ProtectedRoute>} />
              <Route path="/owner/reviews"   element={<ProtectedRoute><OwnerReviewsPage /></ProtectedRoute>} />
              <Route path="/owner/analytics" element={<ProtectedRoute><OwnerAnalyticsPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/dashboard"    element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/reports"      element={<ProtectedRoute><ReportsManagementPage /></ProtectedRoute>} />
              <Route path="/admin/verification" element={<ProtectedRoute><VerificationQueuePage /></ProtectedRoute>} />
              <Route path="/admin/users"        element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <ChatbotWidget />

      <footer className="footer">
        <div className="footer__inner">
          <div>
            <div className="footer__brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={logoSvg} alt="" style={{ width: 28, height: 28 }} />
              FoodTabs
            </div>
            <div style={{ fontSize: 13, marginTop: 6, color: 'rgba(255,255,255,0.45)' }}>
              Your go-to guide for great food experiences
            </div>
          </div>
          <div className="footer__copy">
            © {new Date().getFullYear()} FoodTabs — MERN Stack Project
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
