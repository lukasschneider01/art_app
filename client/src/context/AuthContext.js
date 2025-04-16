import React, { createContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token in headers
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    setLoading(true);

    if (token) {
      setAuthToken(token);

      try {
        const res = await api.get('/api/users/me');

        if (!res.data) {
          throw new Error('No user data received');
        }

        // Set authentication state first
        setIsAuthenticated(true);
        // Then set user data to ensure proper state synchronization
        setUser(res.data);

        // Log authentication state for debugging
        console.log('Auth state after load:', {
          isAuthenticated: true,
          user: res.data,
          role: res.data.role
        });
      } catch (err) {
        console.error('Error loading user:', err);
        // Clear all auth state on error
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
        setError(err.response?.data?.msg || 'Authentication failed. Please login again.');
      }
    } else {
      // No token found, ensure auth state is cleared
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
    }

    setLoading(false);
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await api.post('/api/auth/register', formData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      // Clear any previous state
      setError(null);
      setLoading(true);
      console.log('Starting login process with:', { email: formData.email });

      const res = await api.post('/api/auth/login', formData);

      if (!res.data || !res.data.token || !res.data.user) {
        throw new Error('Invalid response from server');
      }

      console.log('Login response received:', { token: 'exists', user: res.data.user });

      // Set token first to ensure it's available for subsequent requests
      setToken(res.data.token);
      setAuthToken(res.data.token);

      // Set user data
      setUser(res.data.user);

      // Set authenticated state
      setIsAuthenticated(true);

      // Force a small delay to ensure state is updated before further operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Double check that authentication state is properly set
      if (!isAuthenticated) {
        console.log('Forcing authentication state update');
        setIsAuthenticated(true);
      }

      return res.data;
    } catch (err) {
      console.error('Login error details:', err);
      console.log('Login error response:', err.response?.data);

      // Clear authentication state on error
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);

      setError(err.response?.data?.msg || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  };

  // Verify token for survey access
  const verifyToken = async (token) => {
    try {
      const res = await api.get(`/api/auth/verify-token/${token}`);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Token verification failed');
      throw err;
    }
  };

  // Clear errors
  const clearErrors = () => setError(null);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        error,
        register,
        login,
        logout,
        clearErrors,
        verifyToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;