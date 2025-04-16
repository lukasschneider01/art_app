import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../config/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching users');
      setLoading(false);
      console.error(err);
    }
  };
  
  // Handle user approval
  const handleApproveUser = async (userId) => {
    try {
      await api.post(`/api/auth/approve/${userId}`);
      
      // Update user in state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isApproved: true } : user
      ));
      
      setSuccessMessage('User approved successfully. Access email has been sent.');
      setOpenSnackbar(true);
    } catch (err) {
      setError('Error approving user');
      setOpenSnackbar(true);
      console.error(err);
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/api/users/${userToDelete}`);
      
      // Remove user from state
      setUsers(users.filter(user => user._id !== userToDelete));
      
      setSuccessMessage('User deleted successfully');
      setOpenSnackbar(true);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError('Error deleting user');
      setOpenSnackbar(true);
      setDeleteDialogOpen(false);
      console.error(err);
    }
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter users based on active tab
  const filteredUsers = tabValue === 0 
    ? users 
    : tabValue === 1 
      ? users.filter(user => !user.isApproved) 
      : users.filter(user => user.isApproved);
  
  return (
    <Paper className="form-container">
      <Box className="admin-header">
        <Typography variant="h4" component="h1">
          Manage Users
        </Typography>
        <Button component={Link} to="/admin" variant="outlined">
          Back to Dashboard
        </Button>
      </Box>
      
      <Box className="admin-nav" mb={4}>
        <Button component={Link} to="/admin" variant="outlined">
          Dashboard
        </Button>
        <Button component={Link} to="/admin/users" variant="contained" color="primary">
          Manage Users
        </Button>
        <Button component={Link} to="/admin/surveys" variant="outlined">
          View Surveys
        </Button>
      </Box>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Users" />
        <Tab 
          label={`Pending Approval (${users.filter(user => !user.isApproved).length})`} 
          sx={{ 
            color: users.filter(user => !user.isApproved).length > 0 ? 'warning.main' : 'inherit',
            fontWeight: users.filter(user => !user.isApproved).length > 0 ? 'bold' : 'normal'
          }}
        />
        <Tab label="Approved Users" />
      </Tabs>
      
      {loading ? (
        <Typography>Loading users...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredUsers.length === 0 ? (
        <Alert severity="info">
          {tabValue === 1 ? 'No pending approvals' : 'No users found'}
        </Alert>
      ) : (
        <TableContainer>
          <Table className="admin-table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.isApproved ? (
                      <Chip 
                        label="Approved" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    ) : (
                      <Chip 
                        label="Pending" 
                        color="warning" 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {!user.isApproved && (
                      <IconButton 
                        color="success" 
                        onClick={() => handleApproveUser(user._id)}
                        title="Approve User"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      color="error" 
                      onClick={() => openDeleteDialog(user._id)}
                      title="Delete User"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Success/Error Snackbar */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={successMessage ? "success" : "error"} 
          sx={{ width: '100%' }}
        >
          {successMessage || error}
        </Alert>
      </Snackbar>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminUsers;