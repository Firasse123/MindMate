import { create } from "zustand";
import axios from "axios";

const API_URL ="http://localhost:5000/api/auth";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions for token storage
const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.warn('Failed to get token from localStorage:', error);
    return null;
  }
};

const setStoredToken = (token) => {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  } catch (error) {
    console.warn('Failed to store token in localStorage:', error);
  }
};

const removeStoredToken = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.warn('Failed to remove token from localStorage:', error);
  }
};

// Function to set auth header on axios instance
const setAuthHeader = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const useAuthStore = create((set, get) => {
  // Initialize token from localStorage when store is created
  const initialToken = getStoredToken();
  if (initialToken) {
    setAuthHeader(initialToken);
  }

  return {
    user: null,
    isAuthenticated: false,
    error: null,
    message: null,
    isLoading: false,
    isCheckingAuth: true,
    token: initialToken,

    authHeaders: () => {
      const { token } = get();
      return { Authorization: token ? `Bearer ${token}` : "" };
    },

    signup: async (email, password, name) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/signup', { email, password, name });
        const token = response.data.token;
        
        // Store token and set auth header
        if (token) {
          setStoredToken(token);
          setAuthHeader(token);
        }
        
        set({ 
          user: response.data.user, 
          token: token || null,
          isAuthenticated: !!token, 
          isLoading: false 
        });
      } catch (error) {
        set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
        throw error;
      }
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/login', { email, password });
        const token = response.data.token;

        // Store token and set auth header
        if (token) {
          setStoredToken(token);
          setAuthHeader(token);
        }

        set({
          user: response.data.user,
          token: token || null,
          isAuthenticated: !!token,
          isLoading: false,
        });

        return response.data;
      } catch (error) {
        set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
        throw error;
      }
    },

    checkAuth: async () => {
      set({ isCheckingAuth: true, error: null });

      // Get token from store or localStorage
      let token = get().token;
      if (!token) {
        token = getStoredToken();
        if (token) {
          // Update store and axios header with found token
          set({ token });
          setAuthHeader(token);
        }
      }

      if (!token) {
        console.log("🔍 No token found, user not authenticated");
        set({ isAuthenticated: false, isCheckingAuth: false, user: null, token: null });
        return;
      }

      try {
        console.log("🔍 Checking auth with token:", token.substring(0, 20) + "...");
        
        const response = await apiClient.get('/check-auth');
        
        console.log("✅ Check auth successful:", response.data);
        
        set({
          user: response.data.user,
          isAuthenticated: true,
          isCheckingAuth: false,
          token,
        });
      } catch (error) {
        console.error("❌ Check auth failed:", {
          status: error.response?.status,
          message: error.response?.data?.message,
          token: token?.substring(0, 20) + "..."
        });

        if (error.response?.status === 401 || error.response?.status === 403) {
          // Clear invalid token
          removeStoredToken();
          setAuthHeader(null);
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isCheckingAuth: false,
            error: error.response?.data?.message || "Authentication failed",
          });
        } else {
          console.warn("Server error during auth check, keeping user logged in");
          set({
            isCheckingAuth: false,
            error: "Server error during authentication check"
          });
        }
      }
    },

    logout: () => {
      // Clear token from storage and axios header
      removeStoredToken();
      setAuthHeader(null);
      
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        error: null, 
        message: null 
      });
    },

    forgotPassword: async (email) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/forgot-password', { email });
        set({ message: response.data.message, isLoading: false });
        return response.data;
      } catch (error) {
        set({ error: error.response?.data?.message || "Error sending reset email", isLoading: false });
        throw error;
      }
    },

    resetPassword: async (token, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post(`/reset-password/${token}`, { password });
        set({ message: response.data.message, isLoading: false });
        return response.data;
      } catch (error) {
        set({ error: error.response?.data?.message || "Error resetting password", isLoading: false });
        throw error;
      }
    },

    verifyEmail: async (code) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/verify-email', { code });
        const token = response.data.token;
        
        // If a new token is returned, store it
        if (token) {
          setStoredToken(token);
          setAuthHeader(token);
        }
        
        set({ 
          user: response.data.user, 
          token: token || get().token,
          isAuthenticated: true, 
          isLoading: false 
        });
        return response.data;
      } catch (error) {
        set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
        throw error;
      }
    },

    clearError: () => set({ error: null }),
    clearMessage: () => set({ message: null }),
  };
});

// Optional: Add axios interceptors for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, automatically logout
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
    }
    return Promise.reject(error);
  }
);

// Export the configured axios instance for use in other parts of your app
export { apiClient };