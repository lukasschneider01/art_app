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
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
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

  // Helper function to render array data as a list
  const renderArrayField = (data, emptyMessage = "None specified") => {
    if (!data || data.length === 0) return <Typography variant="body2" color="textSecondary">{emptyMessage}</Typography>;

    return (
      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
        {data.map((item, index) => (
          <li key={index}>
            <Typography variant="body2">{item}</Typography>
          </li>
        ))}
      </ul>
    );
  };

  // Helper function to format field display
  const formatFieldValue = (value) => {
    if (value === undefined || value === null || value === '') {
      return <Typography variant="body2" color="textSecondary">Not specified</Typography>;
    }

    if (typeof value === 'boolean') {
      return <Typography variant="body2">{value ? 'Yes' : 'No'}</Typography>;
    }

    return <Typography variant="body2">{value}</Typography>;
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
        open={!!selectedSurvey}
        onClose={() => setSelectedSurvey(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSurvey && (
          <>
            <DialogTitle>
              Survey Details
              <IconButton
                aria-label="close"
                onClick={() => setSelectedSurvey(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>Basic Profile</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Name</Typography>
                  {formatFieldValue(selectedSurvey.fullName)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Email</Typography>
                  {formatFieldValue(selectedSurvey.email)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Age</Typography>
                  {formatFieldValue(selectedSurvey.age)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Location</Typography>
                  {formatFieldValue(selectedSurvey.country)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Gender</Typography>
                  {formatFieldValue(selectedSurvey.gender)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">College/University</Typography>
                  {formatFieldValue(selectedSurvey.college)}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Artistic Experience</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Years of Experience</Typography>
                  {formatFieldValue(selectedSurvey.experienceYears)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Hours per Week</Typography>
                  {formatFieldValue(selectedSurvey.hoursPerWeek)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Art Styles</Typography>
                  {renderArrayField(selectedSurvey.artStyle)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Major Influences</Typography>
                  {renderArrayField(selectedSurvey.majorInfluences)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Art Education</Typography>
                  {formatFieldValue(selectedSurvey.training)}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Sharing & Community</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Has Exhibited Work</Typography>
                  {formatFieldValue(selectedSurvey.hasExhibited)}
                </Grid>
                {selectedSurvey.hasExhibited && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Exhibition Source</Typography>
                    {formatFieldValue(selectedSurvey.exhibitionSource)}
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Platform Links</Typography>
                  {formatFieldValue(selectedSurvey.platformLinks)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Collaborates with Others</Typography>
                  {formatFieldValue(selectedSurvey.collaborates)}
                </Grid>
                {selectedSurvey.collaborates && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Collaboration Description</Typography>
                    {formatFieldValue(selectedSurvey.collaborationDescription)}
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Feedback Sources</Typography>
                  {renderArrayField(selectedSurvey.feedbackSource)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Community Participation</Typography>
                  {formatFieldValue(selectedSurvey.communityParticipation)}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Creative Process</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Uses References</Typography>
                  {formatFieldValue(selectedSurvey.usesReferences)}
                </Grid>
                {selectedSurvey.usesReferences && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Reference Description</Typography>
                    {formatFieldValue(selectedSurvey.referenceDescription)}
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Creative Rituals</Typography>
                  {renderArrayField(selectedSurvey.creativeRituals)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Tools Used</Typography>
                  {renderArrayField(selectedSurvey.toolsUsed)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Preferred Creation Time</Typography>
                  {formatFieldValue(selectedSurvey.preferredCreationTime)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Emotional State</Typography>
                  {formatFieldValue(selectedSurvey.emotionalState)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Mood Influence</Typography>
                  {formatFieldValue(selectedSurvey.moodInfluence)}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Career & Goals</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Monetizes Art</Typography>
                  {formatFieldValue(selectedSurvey.monetizes)}
                </Grid>
                {selectedSurvey.monetizes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Monetization Methods</Typography>
                    {formatFieldValue(selectedSurvey.monetizationMethods)}
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Career Challenges</Typography>
                  {renderArrayField(selectedSurvey.careerChallenges)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Skills to Improve</Typography>
                  {renderArrayField(selectedSurvey.skillsToImprove)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Future Goals</Typography>
                  {formatFieldValue(selectedSurvey.fiveYearGoal)}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Consent & Updates</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Wants Updates</Typography>
                  {formatFieldValue(selectedSurvey.wantsUpdates)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Consents to Research</Typography>
                  {formatFieldValue(selectedSurvey.consentToResearch)}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Audio Introduction</Typography>
              {selectedSurvey.audioIntroduction ? (
                <Box sx={{ my: 2 }}>
                  <audio controls src={selectedSurvey.audioIntroduction} style={{ width: '100%' }} />
                </Box>
              ) : (
                <Typography variant="body2" color="error">Audio file not available</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSurvey(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default AdminSurveys;