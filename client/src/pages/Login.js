import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Paper, Box, Alert, CircularProgress } from '@mui/material';
import AuthContext from '../context/AuthContext';
import api from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, isAuthenticated, user, clearErrors, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [formError, setFormError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearErrors();
    setFormError('');
  };

  // Reset login state when component mounts or when auth state changes
  useEffect(() => {
    setIsLoggingIn(false);
  }, []);

  // Handle user state changes for navigation
  useEffect(() => {
    // Only proceed if we're authenticated and not loading
    if (isAuthenticated && user && !loading) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        // Non-admin user flow
        if (!user.isApproved) {
          setFormError('Your account is pending approval. Please wait for admin approval.');
          return;
        }

        // Check if user has already submitted a survey
        const checkSurveySubmission = async () => {
          try {
            const surveyRes = await api.get(`/api/survey/check-submission/${user._id}`);
            if (surveyRes.data.hasSubmitted) {
              // User has already submitted a survey - show message and prevent navigation
              setFormError('You have already completed the survey. Thank you for your participation!');
            } else {
              // User has not submitted a survey yet - proceed to survey
              navigate('/survey');
            }
          } catch (surveyErr) {
            console.error('Error checking survey submission:', surveyErr);
            setFormError('An error occurred while checking your survey status. Please try again.');
          } finally {
            setIsLoggingIn(false);
          }
        };

        checkSurveySubmission();
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  const onSubmit = async e => {
    e.preventDefault();

    // Prevent multiple login attempts
    if (isLoggingIn) {
      return;
    }

    // Validate form
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      setIsLoggingIn(true);
      setFormError('');
      await login({ email, password });
      // The useEffect hook will handle navigation after successful login
    } catch (err) {
      console.error('Login error:', err);
      setFormError('Login failed. Please check your credentials and try again.');
      setIsLoggingIn(false);
    }
  };

  return (
    <Paper className="form-container">
      <Typography variant="h4" component="h1" className="form-title">
        Login
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

      <form onSubmit={onSubmit}>
        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          disabled={isLoggingIn}
        />

        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          disabled={isLoggingIn}
        />

        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoggingIn}
          >
            {isLoggingIn ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account? <Link to="/register">Register here</Link>
          </Typography>
        </Box>
      </form>
    </Paper>
  );
};

export default Login;