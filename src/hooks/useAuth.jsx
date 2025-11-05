// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import { API_URL } from '../services/api';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [keystoneUserId, setKeystoneUserId] = useState(null);
  
  // Get Clerk user data
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();

  // Fetch Keystone user ID when Clerk user is available
  useEffect(() => {
    const fetchKeystoneUserId = async () => {
      if (!clerkLoaded || !isSignedIn || !clerkUser) {
        setKeystoneUserId(null);
        return;
      }

      try {
        console.log('Fetching Keystone user ID for Clerk user:', clerkUser.id);
        
        const query = `
          query GetUserByClerkId($clerkId: String!) {
            users(where: { clerkId: { equals: $clerkId } }) {
              id
              email
              name
              clerkId
            }
          }
        `;

          const response = await fetch(`${API_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { clerkId: clerkUser.id }
          }),
        });

        const result = await response.json();
        
        if (result.data?.users?.[0]?.id) {
          const userId = result.data.users[0].id;
          console.log('Found Keystone user ID:', userId);
          setKeystoneUserId(userId);
        } else {
          console.warn('No Keystone user found for Clerk ID:', clerkUser.id);
          setKeystoneUserId(null);
        }
      } catch (error) {
        console.error('Error fetching Keystone user ID:', error);
        setKeystoneUserId(null);
      }
    };

    fetchKeystoneUserId();
  }, [clerkLoaded, isSignedIn, clerkUser]);

  // Initialize admin auth from localStorage
  const initializeAuth = useCallback(async () => {
    try {
      // Check admin token (keep existing admin system)
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          const response = await authService.getAdminProfile(adminToken);
          if (response.success && response.data.admin) {
            setAdmin(response.data.admin);
          } else {
            localStorage.removeItem('adminToken');
          }
        } catch {
          localStorage.removeItem('adminToken');
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // --------- Admin Auth Functions (keep existing) ---------
  const adminLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.adminLogin(email, password);
      
      if (response.success && response.token && response.data.admin) {
        localStorage.setItem('adminToken', response.token);
        setAdmin(response.data.admin);
        toast.success('Admin login successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Admin login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admin login failed');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    toast.success('Admin logged out successfully');
  };

  const hasAdminPermission = (permission) => {
    return admin?.permissions?.includes(permission) || admin?.role === 'super_admin';
  };

  // --------- User Auth (now uses Clerk) ---------
  const isAuthenticated = isSignedIn;
  const isAdminAuthenticated = Boolean(admin);
  
  // Create a user object from Clerk data for compatibility
  const user = clerkUser ? {
    id: keystoneUserId, // Keystone user ID
    clerkId: clerkUser.id, // Clerk user ID
    email: clerkUser.primaryEmailAddress?.emailAddress,
    name: clerkUser.fullName || clerkUser.firstName || clerkUser.username,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  } : null;
  
  const userId = keystoneUserId; // Return Keystone user ID

  // Legacy login/register functions (no longer used with Clerk)
  const login = async (email, password) => {
    toast.error('Please use the Clerk sign-in instead');
    return { success: false, message: 'Use Clerk authentication' };
  };

  const register = async (userData) => {
    toast.error('Please use the Clerk sign-up instead');
    return { success: false, message: 'Use Clerk authentication' };
  };

  const logout = () => {
    toast.info('Please use the Clerk sign-out button');
  };

  return (
    <AuthContext.Provider
      value={{
        user, // Combined Clerk + Keystone user object
        admin,
        isLoading,
        isInitialized: isInitialized && clerkLoaded,
        isAuthenticated,
        isAdminAuthenticated,
        userId, // Keystone user ID
        keystoneUserId, // Explicit Keystone ID
        clerkUser, // Raw Clerk user object
        login, // Deprecated - use Clerk
        register, // Deprecated - use Clerk
        logout, // Deprecated - use Clerk
        adminLogin,
        adminLogout,
        hasAdminPermission,
        initializeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default useAuth;