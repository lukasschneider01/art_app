import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';

// Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Survey from './pages/Survey';
import ThankYou from './pages/ThankYou';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSurveys from './pages/admin/Surveys';

// Components
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/thank-you" element={<ThankYou />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="/admin/surveys" element={
            <AdminRoute>
              <AdminSurveys />
            </AdminRoute>
          } />
        </Routes>
      </Container>
    </AuthProvider>
  );
}

export default App;