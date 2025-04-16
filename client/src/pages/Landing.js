import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Paper, Box, Grid } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

const Landing = () => {
  return (
    <Paper elevation={0} className="form-container">
      <Box textAlign="center" mb={4}>
        <PaletteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Art Survey for Research
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Help shape the future of digital platforms for artists
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            About This Survey
          </Typography>
          <Typography paragraph>
            This survey is part of a Master's research project at the Technical University of Berlin,
            focused on understanding the needs and workflows of artists across various disciplines.
          </Typography>
          <Typography paragraph>
            The data collected will help inform the development of a new platform designed specifically
            to support artists in sharing, collaborating, and growing their practice.
          </Typography>
          <Typography paragraph>
            The survey takes approximately 35 minutes to complete and covers topics such as your artistic
            background, creative process, and experiences with existing platforms.
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            How to Participate
          </Typography>
          <Typography paragraph>
            To ensure the quality of our research data, we're using an approval-based system for survey access that is only accepted through a trusted referral.
          </Typography>
          <Typography paragraph>
            1. Register with your name and email
          </Typography>
          <Typography paragraph>
            2. Wait for approval (usually within 12 hours)
          </Typography>
          <Typography paragraph>
            3. Receive an access link via email
          </Typography>
          <Typography paragraph>
            4. Complete the survey within 7 days
          </Typography>

          <Box mt={4} textAlign="center">
            <Button
              component={Link}
              to="/register"
              variant="contained"
              color="primary"
              size="large"
            >
              Register for Access
            </Button>
            <Box mt={2}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                color="primary"
              >
                Already registered? Login
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box mt={6} pt={3} borderTop={1} borderColor="divider" textAlign="center">
        <Typography variant="body2" color="textSecondary">
          This research project is conducted by Lukas Schneider and Carlos Schmidt.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          For questions, please contact: lukasschneiderr01@gmail.com
        </Typography>
      </Box>
    </Paper>
  );
};

export default Landing;