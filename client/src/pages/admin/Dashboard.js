import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Paper, Box, Grid, Card, CardContent, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalSurveys: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get pending users count
        const pendingUsersRes = await axios.get('/api/users/pending');
        
        // Get all users count
        const allUsersRes = await axios.get('/api/users');
        
        // Get surveys count
        const surveysRes = await axios.get('/api/survey');
        
        setStats({
          totalUsers: allUsersRes.data.length,
          pendingUsers: pendingUsersRes.data.length,
          totalSurveys: surveysRes.data.length
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <Paper className="form-container">
      <Box className="admin-header">
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1">
          Welcome, {user?.name}
        </Typography>
      </Box>
      
      <Box className="admin-nav" mb={4}>
        <Button component={Link} to="/admin" variant="contained" color="primary">
          Dashboard
        </Button>
        <Button component={Link} to="/admin/users" variant="outlined">
          Manage Users
        </Button>
        <Button component={Link} to="/admin/surveys" variant="outlined">
          View Surveys
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className="admin-card">
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="admin-card" style={{ backgroundColor: stats.pendingUsers > 0 ? '#fff8e1' : 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <NotificationsIcon fontSize="large" color={stats.pendingUsers > 0 ? 'warning' : 'disabled'} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5">{stats.pendingUsers}</Typography>
                  <Typography variant="body2" color="textSecondary">Pending Approvals</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="admin-card">
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5">{stats.totalSurveys}</Typography>
                  <Typography variant="body2" color="textSecondary">Survey Responses</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              component={Link} 
              to="/admin/users" 
              variant="outlined" 
              color="primary" 
              fullWidth
              sx={{ py: 2 }}
            >
              Manage User Approvals
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              component={Link} 
              to="/admin/surveys" 
              variant="outlined" 
              color="primary" 
              fullWidth
              sx={{ py: 2 }}
            >
              View Survey Responses
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              component={Link} 
              to="/admin/surveys" 
              variant="outlined" 
              color="primary" 
              fullWidth
              sx={{ py: 2 }}
            >
              Export Survey Data
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AdminDashboard;