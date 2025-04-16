import React, { useState, useEffect } from 'react';
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
  IconButton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import api from '../../config/api';

const AdminSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Fetch all surveys on component mount
  useEffect(() => {
    fetchSurveys();
  }, []);
  
  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/survey');
      setSurveys(res.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching surveys');
      setLoading(false);
      console.error(err);
    }
  };
  
  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      window.open('/api/survey/export/csv', '_blank');
    } catch (err) {
      setError('Error exporting data');
      console.error(err);
    }
  };
  
  // Open survey detail dialog
  const openDetailDialog = (survey) => {
    setSelectedSurvey(survey);
    setDetailDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <Paper className="form-container">
      <Box className="admin-header">
        <Typography variant="h4" component="h1">
          Survey Responses
        </Typography>
        <Button component={Link} to="/admin" variant="outlined">
          Back to Dashboard
        </Button>
      </Box>
      
      <Box className="admin-nav" mb={4}>
        <Button component={Link} to="/admin" variant="outlined">
          Dashboard
        </Button>
        <Button component={Link} to="/admin/users" variant="outlined">
          Manage Users
        </Button>
        <Button component={Link} to="/admin/surveys" variant="contained" color="primary">
          View Surveys
        </Button>
      </Box>
      
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GetAppIcon />}
          onClick={handleExportCSV}
        >
          Export All as CSV
        </Button>
      </Box>
      
      {loading ? (
        <Typography>Loading surveys...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : surveys.length === 0 ? (
        <Alert severity="info">No survey responses found</Alert>
      ) : (
        <TableContainer>
          <Table className="admin-table">
            <TableHead>
              <TableRow>
                <TableCell>Submission Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Discipline</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Consent</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surveys.map(survey => (
                <TableRow key={survey._id}>
                  <TableCell>{formatDate(survey.submittedAt)}</TableCell>
                  <TableCell>{survey.fullName}</TableCell>
                  <TableCell>{survey.email}</TableCell>
                  <TableCell>{survey.primaryDiscipline}</TableCell>
                  <TableCell>{survey.country}</TableCell>
                  <TableCell>
                    {survey.consentToResearch ? (
                      <Chip label="Consented" color="success" size="small" />
                    ) : (
                      <Chip label="No Consent" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton 
                        color="primary" 
                        onClick={() => openDetailDialog(survey)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Survey Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedSurvey && (
          <>
            <DialogTitle>
              Survey Response Details
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Full Name</Typography>
                    <Typography variant="body1">{selectedSurvey.fullName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Email</Typography>
                    <Typography variant="body1">{selectedSurvey.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Age</Typography>
                    <Typography variant="body1">{selectedSurvey.age}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Country</Typography>
                    <Typography variant="body1">{selectedSurvey.country}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Primary Discipline</Typography>
                    <Typography variant="body1">{selectedSurvey.primaryDiscipline}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Experience</Typography>
                    <Typography variant="body1">{selectedSurvey.experienceYears}</Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Audio Introduction</Typography>
                {selectedSurvey.audioIntroduction && (
                  <audio controls>
                    <source src={selectedSurvey.audioIntroduction} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </Box>

              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Artistic Experience</Typography>
                <Typography variant="subtitle2">Background</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.background}</Typography>
                
                <Typography variant="subtitle2">Training</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.training}</Typography>
                
                <Typography variant="subtitle2">Mediums Used</Typography>
                <Typography variant="body1" paragraph>
                  {selectedSurvey.mediums.join(', ')}
                </Typography>
                
                <Typography variant="subtitle2">Hours Per Week</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.hoursPerWeek}</Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Sharing & Community</Typography>
                <Typography variant="subtitle2">Platforms Used</Typography>
                <Typography variant="body1" paragraph>
                  {selectedSurvey.platforms.length > 0 ? selectedSurvey.platforms.join(', ') : 'None'}
                </Typography>
                
                <Typography variant="subtitle2">Has Exhibited Work</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.hasExhibited ? 'Yes' : 'No'}</Typography>
                
                {selectedSurvey.hasExhibited && (
                  <>
                    <Typography variant="subtitle2">Exhibition Source</Typography>
                    <Typography variant="body1" paragraph>{selectedSurvey.exhibitionSource}</Typography>
                  </>
                )}
                
                <Typography variant="subtitle2">Collaborates with Others</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.collaborates ? 'Yes' : 'No'}</Typography>
                
                {selectedSurvey.collaborates && (
                  <>
                    <Typography variant="subtitle2">Collaboration Description</Typography>
                    <Typography variant="body1" paragraph>{selectedSurvey.collaborationDescription}</Typography>
                  </>
                )}
              </Box>
              
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Creative Process</Typography>
                <Typography variant="subtitle2">Idea Generation</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.ideaGeneration}</Typography>
                
                <Typography variant="subtitle2">Uses References</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.usesReferences ? 'Yes' : 'No'}</Typography>
                
                <Typography variant="subtitle2">Challenges</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.challenges}</Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Career & Goals</Typography>
                <Typography variant="subtitle2">Monetizes Work</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.monetizes ? 'Yes' : 'No'}</Typography>
                
                {selectedSurvey.monetizes && (
                  <>
                    <Typography variant="subtitle2">Monetization Methods</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedSurvey.monetizationMethods.join(', ')}
                    </Typography>
                  </>
                )}
                
                <Typography variant="subtitle2">Five Year Goal</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.fiveYearGoal}</Typography>
                
                <Typography variant="subtitle2">Platform Suggestion</Typography>
                <Typography variant="body1" paragraph>{selectedSurvey.platformSuggestion}</Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>Consent & Updates</Typography>
                <Typography variant="subtitle2">Consent to Research</Typography>
                <Typography variant="body1" paragraph>
                  {selectedSurvey.consentToResearch ? 'Yes' : 'No'}
                </Typography>
                
                <Typography variant="subtitle2">Wants Updates</Typography>
                <Typography variant="body1">
                  {selectedSurvey.wantsUpdates ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

const Grid = ({ container, item, xs, spacing, children }) => {
  if (container) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1 * (spacing || 1) }}>
        {children}
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      width: xs === 6 ? '50%' : '100%', 
      padding: spacing || 1,
      boxSizing: 'border-box'
    }}>
      {children}
    </Box>
  );
};

export default AdminSurveys;