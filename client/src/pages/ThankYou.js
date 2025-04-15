import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Paper, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ThankYou = () => {
  return (
    <Paper className="thank-you-container">
      <CheckCircleIcon className="thank-you-icon" />
      <Typography variant="h4" component="h1" gutterBottom>
        Thank You for Your Participation!
      </Typography>
      
      <Typography variant="h6" color="textSecondary" paragraph>
        Your survey responses have been successfully submitted.
      </Typography>
      
      <Typography paragraph>
        Your insights will help inform the development of better tools and platforms for artists.
        We appreciate the time you've taken to share your experiences and perspectives.
      </Typography>
      
      <Typography paragraph>
        If you opted to receive updates, we'll be in touch when the research results are available
        or when there are developments with the platform.
      </Typography>
      
      <Box mt={4}>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          color="primary"
        >
          Return to Home
        </Button>
      </Box>
    </Paper>
  );
};

export default ThankYou;