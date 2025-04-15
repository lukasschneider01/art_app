import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Paper, Box, Alert } from '@mui/material';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, isAuthenticated, user, clearErrors } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formError, setFormError] = useState('');
  
  const { email, password } = formData;
  
  // We'll only redirect after a successful login action, not automatically on page load
  // This prevents the automatic redirection when a user visits the login page
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearErrors();
    setFormError('');
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    try {
      const result = await login({ email, password });
      // Handle redirection after successful login based on user role
      if (result && result.token) {
        // Wait for user data to be loaded
        setTimeout(async () => {
          if (user) {
            if (user.role === 'admin') {
              navigate('/admin');
            } else {
              // Non-admin user flow
              if (!user.isApproved) {
                setFormError('Your account is pending approval. Please wait for admin approval.');
                return;
              }
              
              // Check if user has already submitted a survey
              try {
                const surveyRes = await axios.get(`/api/survey/check-submission/${user._id}`);
                if (surveyRes.data.hasSubmitted) {
                  // User has already submitted a survey - show message and prevent navigation
                  setFormError('You have already completed the survey. Thank you for your participation!');
                  return;
                } else {
                  // User has not submitted a survey yet - proceed to survey
                  navigate('/survey');
                }
              } catch (surveyErr) {
                console.error('Error checking survey submission:', surveyErr);
                setFormError('An error occurred while checking your survey status. Please try again.');
              }
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error(err);
      setFormError('Login failed. Please check your credentials and try again.');
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
        />
        
        <Box mt={3}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
          >
            Login
          </Button>
        </Box>
        
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Don't have an account? <Link to="/register">Register</Link>
          </Typography>
        </Box>
      </form>
    </Paper>
  );
};

export default Login;