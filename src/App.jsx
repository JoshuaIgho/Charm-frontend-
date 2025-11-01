// App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import syncUser from "./utils/syncUser.js";
import "react-toastify/dist/ReactToastify.css";

// Context Providers
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { WishlistProvider } from "./contexts/WishlistContext";

// Layout Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import AddProductPage from "./components/admin/AddProductPage";
import AdminProductsPage from "./components/admin/AdminProductsPage";

// Import the new styled pages
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";

// Pages
import HomePage from "./pages/HomePage";
import ProductList from "./Products";
import UserDashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage";
import AddressesPage from "./pages/AddressesPage";
import SettingsPage from "./pages/SettingsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";

// Global Styles
import "./styles/globals.css";
import "./style.css";
import checkBackendHealth from './utils/backendHealthCheck';
import useKeepAlive from './hooks/useKeepAlive';


// ---------------- ADMIN LOGIN ----------------
function AdminLogin({ handleSuccess }) {
  return (
    <div className="login-container flex items-center justify-center min-h-[70vh]">
      <div className="login-card p-6 bg-white shadow rounded-xl text-center">
        <h1 className="text-2xl font-bold mb-2">Admin Portal</h1>
        <p className="text-gray-600 mb-4">
          Please sign in with your Google account
        </p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log("Google Login Failed")}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="pill"
        />
      </div>
    </div>
  );
}

// ---------------- ADMIN PROTECTED ROUTE ----------------
function AdminProtectedRoute({ isAuthenticated, user, handleLogout }) {
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You must log in with Google to view this page.
          </p>
          <a
            href="/admin"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return <AdminPanel user={user} onLogout={handleLogout} />;
}

// ---------------- MAIN ROUTES WITH WISHLIST CONTEXT ----------------
function AppRoutes({ isAuthenticated, setIsAuthenticated, user, setUser }) {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();

  // Handle Google OAuth Success
  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      const userData = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      setUser(userData);
      setIsAuthenticated(true);

      localStorage.setItem("adminUser", JSON.stringify(userData));
      navigate("/adminPanel");
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  // Get userId from Clerk for WishlistProvider
  const userId = clerkUser?.id;

  return (
    <WishlistProvider userId={userId}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Clerk Auth */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        
        {/* User Dashboard (Clerk Protected) */}
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <UserDashboard />
            </SignedIn>
          }
        />

        {/* Extra Clerk Protected Routes */}
        <Route
          path="/profile"
          element={
            <SignedIn>
              <ProfilePage />
            </SignedIn>
          }
        />

        <Route
          path="/addresses"
          element={
            <SignedIn>
              <AddressesPage />
            </SignedIn>
          }
        />
        
        <Route
          path="/settings"
          element={
            <SignedIn>
              <SettingsPage />
            </SignedIn>
          }
        />

        {/* Checkout Routes (Clerk Protected) */}
        <Route
          path="/checkout"
          element={
            <SignedIn>
              <CheckoutPage />
            </SignedIn>
          }
        />
        
        <Route
          path="/order-confirmation/:orderId"
          element={
            <SignedIn>
              <OrderConfirmationPage />
            </SignedIn>
          }
        />

        {/* Admin (Google OAuth) */}
        <Route
          path="/admin"
          element={<AdminLogin handleSuccess={handleSuccess} />}
        />
        <Route path="/admin/products/new" element={<AddProductPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />

        <Route
          path="/adminPanel"
          element={
            <AdminProtectedRoute
              isAuthenticated={isAuthenticated}
              user={user}
              handleLogout={handleLogout}
            />
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <a
                  href="/"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </WishlistProvider>
  );
}

// ---------------- MAIN APP COMPONENT ----------------
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState({
    checking: true,
    ready: false,
    error: null
  });
  useKeepAlive(10);
  // ✅ Get both user data and auth from Clerk
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();

  // ✅ Wake up backend on app load (FIRST PRIORITY)
  useEffect(() => {
    const wakeBackend = async () => {
      console.log('🚀 Waking up backend...');
      setBackendStatus({ checking: true, ready: false, error: null });

      try {
        const health = await checkBackendHealth(true);
        
        if (health.ready) {
          console.log('✅ Backend is ready!');
          setBackendStatus({ checking: false, ready: true, error: null });
        } else {
          console.warn('⚠️ Backend not ready:', health.error);
          setBackendStatus({ 
            checking: false, 
            ready: false, 
            error: health.error || 'Backend is not available'
          });
        }
      } catch (error) {
        console.error('❌ Failed to wake backend:', error);
        setBackendStatus({ 
          checking: false, 
          ready: false, 
          error: error.message 
        });
      }
    };

    wakeBackend();
  }, []);

  // ✅ Sync Clerk → Keystone when user signs in (AFTER BACKEND IS READY)
  useEffect(() => {
    const handleUserSync = async () => {
      // Wait for both Clerk AND backend to be ready
      if (!isLoaded || !backendStatus.ready) return;

      // Only sync if user is signed in and we have user data
      if (isSignedIn && clerkUser) {
        try {
          console.log("User signed in, syncing to Keystone...");

          // Extract user data from Clerk
          const userData = {
            clerkId: clerkUser.id,
            email:
              clerkUser.primaryEmailAddress?.emailAddress ||
              clerkUser.emailAddresses[0]?.emailAddress,
            name:
              clerkUser.fullName ||
              clerkUser.firstName ||
              clerkUser.username ||
              "User",
          };

          // Sync with Keystone
          await syncUser(userData);
          console.log("✅ User sync completed successfully");
        } catch (error) {
          console.error("❌ Failed to sync user:", error);
        }
      }
    };

    handleUserSync();
  }, [isLoaded, isSignedIn, clerkUser, backendStatus.ready]);

  
  // ✅ Restore Admin session
  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Show loading screen while backend is waking up
  // if (backendStatus.checking) {
  //   return (
  //     <div style={{
  //       display: 'flex',
  //       flexDirection: 'column',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       minHeight: '100vh',
  //       padding: '20px',
  //       textAlign: 'center',
  //       background: '#f9fafb'
  //     }}>
  //       <div style={{
  //         width: '60px',
  //         height: '60px',
  //         border: '5px solid #e5e7eb',
  //         borderTop: '5px solid #3b82f6',
  //         borderRadius: '50%',
  //         animation: 'spin 1s linear infinite'
  //       }} />
  //       <h2 style={{ 
  //         marginTop: '24px', 
  //         fontSize: '24px', 
  //         fontWeight: '600',
  //         color: '#111827' 
  //       }}>
  //         Waking up backend...
  //       </h2>
  //       <p style={{ 
  //         color: '#6b7280', 
  //         maxWidth: '500px',
  //         marginTop: '12px',
  //         lineHeight: '1.6'
  //       }}>
  //         Our backend is hosted on Render's free tier and may take 30-60 seconds 
  //         to wake up from sleep. Thank you for your patience! ☕
  //       </p>
  //       <style>{`
  //         @keyframes spin {
  //           0% { transform: rotate(0deg); }
  //           100% { transform: rotate(360deg); }
  //         }
  //       `}</style>
  //     </div>
  //   );
  // }

  // // Show error screen if backend failed to wake up
  // if (!backendStatus.ready && backendStatus.error) {
  //   return (
  //     <div style={{
  //       display: 'flex',
  //       flexDirection: 'column',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       minHeight: '100vh',
  //       padding: '20px',
  //       textAlign: 'center',
  //       background: '#f9fafb'
  //     }}>
  //       <div style={{ 
  //         fontSize: '48px', 
  //         marginBottom: '16px' 
  //       }}>
  //         ⚠️
  //       </div>
  //       <h2 style={{ 
  //         color: '#dc2626',
  //         fontSize: '24px',
  //         fontWeight: '600',
  //         marginBottom: '12px'
  //       }}>
  //         Backend Connection Failed
  //       </h2>
  //       <p style={{ 
  //         color: '#6b7280', 
  //         maxWidth: '500px', 
  //         margin: '0 0 24px 0',
  //         lineHeight: '1.6'
  //       }}>
  //         {backendStatus.error}
  //       </p>
  //       <button
  //         onClick={() => window.location.reload()}
  //         style={{
  //           padding: '12px 32px',
  //           background: '#3b82f6',
  //           color: 'white',
  //           border: 'none',
  //           borderRadius: '8px',
  //           cursor: 'pointer',
  //           fontSize: '16px',
  //           fontWeight: '500',
  //           transition: 'background 0.2s'
  //         }}
  //         onMouseOver={(e) => e.target.style.background = '#2563eb'}
  //         onMouseOut={(e) => e.target.style.background = '#3b82f6'}
  //       >
  //         Retry Connection
  //       </button>
  //     </div>
  //   );
  // }

  // // Show app loading state
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  //     </div>
  //   );
  // }

  // Main app render
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <main className="flex-1">
                <AppRoutes
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                  user={user}
                  setUser={setUser}
                />
              </main>
              <Footer />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                theme="light"
                className="z-50"
              />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;