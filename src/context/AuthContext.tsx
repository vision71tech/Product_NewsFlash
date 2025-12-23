import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Set auth token for api requests
  const setAuthToken = (token: string | null) => {
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  // Load user if token exists
  const loadUser = async () => {
    if (token) {
      setAuthToken(token);
      try {
        console.log('Loading user data...');
        const res = await api.get('/api/auth');
        
        // Enhanced logging to debug user data
        console.log('User data response:', res);
        console.log('User data loaded:', { 
          id: res.data?._id, 
          name: res.data?.name, 
          email: res.data?.email,
          fullData: { ...res.data, password: '[REDACTED]' }
        });
        
        // Ensure we have all required user fields
        if (!res.data || !res.data._id || !res.data.name || !res.data.email) {
          console.error('Incomplete user data received:', res.data);
          throw new Error('Incomplete user data received from server');
        }
        
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err: any) {
        console.error('Load user error:', err.response || err);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
        setError(err.response?.data?.msg || 'Session expired. Please login again.');
      }
    } else {
      console.log('No token found, skipping user load');
    }
    setLoading(false);
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting registration for:', { name, email });
      
      const res = await api.post('/api/users', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password 
      });

      console.log('Registration response:', { ...res.data, token: '[REDACTED]' });
      
      if (!res.data.success && !res.data.token) {
        throw new Error(res.data.msg || 'Registration failed - no token received');
      }

      setToken(res.data.token);
      setAuthToken(res.data.token);

      if (res.data.user && res.data.user.id) {
        console.log('User data included in registration response:', {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          isAdmin: res.data.user.isAdmin
        });
        setUser({
          _id: res.data.user.id, // Map from server's 'id'
          name: res.data.user.name,
          email: res.data.user.email,
          isAdmin: res.data.user.isAdmin || false,
        });
        setIsAuthenticated(true);
        // setLoading(false); // setLoading is handled by the finally block
      } else {
        // If user data is not in the response, load it (fallback)
        console.log('User data not in registration response, calling loadUser as fallback.');
        setIsAuthenticated(true); // Still authenticated as token was received
        await loadUser();
      }
      
    } catch (err: any) {
      console.error('Registration error:', err.response || err);
      const errorMsg = err.response?.data?.msg || 
                      err.response?.data?.message ||
                      err.response?.data?.errors?.[0]?.msg ||
                      err.message ||
                      'Registration failed';
      setError(errorMsg);
      setToken(null);
      setAuthToken(null);
      setIsAuthenticated(false);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      setLoading(true);
      setError(null);
      
      const res = await api.post('/api/auth', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log('Login response:', { ...res.data, token: '[REDACTED]' });
      
      if (!res.data || !res.data.token) {
        throw new Error('No token received from server');
      }

      // Check if user data is included in the login response
      if (res.data.user) {
        console.log('User data included in login response:', { 
          id: res.data.user.id, 
          name: res.data.user.name, 
          email: res.data.user.email 
        });
        
        // Set user data directly from login response
        setUser({
          _id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          isAdmin: res.data.user.isAdmin || false
        });
      }

      setToken(res.data.token);
      setAuthToken(res.data.token);
      setIsAuthenticated(true);
      
      // Load user data if not included in login response
      if (!res.data.user) {
        try {
          await loadUser();
        } catch (loadErr) {
          console.error('Error loading user after login:', loadErr);
        }
      }
      
    } catch (err: any) {
      console.error('Login error:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMsg = 'Login failed. Please try again.';
      
      if (err.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Please check your connection.';
      } else if (err.response?.data?.msg) {
        errorMsg = err.response.data.msg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setToken(null);
      setAuthToken(null);
      setIsAuthenticated(false);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};