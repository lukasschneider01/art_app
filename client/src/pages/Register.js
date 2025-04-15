import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Paper, Box, Alert } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, error, clearErrors } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { name, email, password, password2 } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearErrors();
    setFormError('');
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== password2) {
      setFormError('Passwords do not match');
      return;
    }
    
    try {
      await register({ name, email, password });
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        password2: ''
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <Paper className="form-container">
      <Typography variant="h4" component="h1" className="form-title">
        Register for Survey Access
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Registration successful! Please wait for admin approval. You will receive an email when your access is granted.
        </Alert>
      )}
      
      <form onSubmit={onSubmit}>
        <TextField
          label="Full Name"
          variant="outlined"
          fullWidth
          margin="normal"
          name="name"
          value={name}
          onChange={onChange}
          disabled={success}
        />
        
        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          disabled={success}
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
          disabled={success}
        />
        
        <TextField
          label="Confirm Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          name="password2"
          value={password2}
          onChange={onChange}
          disabled={success}
        />
        
        <Box mt={3}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            disabled={success}
          >
            Register
          </Button>
        </Box>
        
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Box>
      </form>
    </Paper>
  );
};

export default Register;