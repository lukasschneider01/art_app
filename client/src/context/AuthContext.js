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
    if (token) {
      setAuthToken(token);
      
      try {
        const res = await api.get('/api/users/me');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error loading user:', err);
        // Clear all auth state on error
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
        setError('Authentication failed. Please login again.');
      }
    } else {
      // No token found, ensure auth state is cleared
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
      
      const res = await api.post('/api/auth/login', formData);
      
      // Set token first
      setToken(res.data.token);
      setAuthToken(res.data.token);
      
      // Load user data
      await loadUser();
      
      return res.data;
    } catch (err) {
      // Clear authentication state on error
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
      
      setError(err.response?.data?.msg || 'Login failed');
      throw err;
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