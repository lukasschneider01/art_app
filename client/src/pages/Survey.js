import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../config/api';
import axios from 'axios';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  Divider,
  Stepper,
  Step,
  StepLabel,
  InputLabel,
  Slider,
  Grid
} from '@mui/material';

const Survey = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Artist Profile
    fullName: '',
    email: '',
    age: '',
    country: '',
    primaryDiscipline: '',
    experienceYears: '',

    // Artistic Experience
    background: '',
    training: '',
    mediums: [],
    hoursPerWeek: '',

    // Sharing & Community
    platforms: [],
    platformLinks: '',
    hasExhibited: '',
    exhibitionSource: '',
    collaborates: '',
    collaborationDescription: '',

    // Creative Process
    ideaGeneration: '',
    usesReferences: '',
    challenges: '',
    preferredCreationTime: '',
    emotionalState: '',
    moodInfluence: '',

    // Career & Goals
    monetizes: '',
    monetizationMethods: [],
    fiveYearGoal: '',
    platformSuggestion: '',

    // Consent
    consentToResearch: '',
    wantsUpdates: ''
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No access token provided. Please use the link sent to your email.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/api/auth/verify-token/${token}`);
        if (res.data.valid) {
          setTokenValid(true);
          setUserData(res.data);
          setFormData(prev => ({
            ...prev,
            fullName: res.data.name,
            email: res.data.email
          }));
        } else {
          setError('Invalid or expired access token. Please request a new one.');
        }
      } catch (err) {
        setError('Invalid or expired access token. Please request a new one.');
      }

      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle multi-select checkbox changes
  const handleMultiCheckboxChange = (name, value) => {
    const currentValues = formData[name];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setFormData({
      ...formData,
      [name]: newValues
    });
  };

  // Handle slider changes
  const handleSliderChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('token', token);

      // Prepare survey data with default values for unchecked fields
      const surveyDataToSubmit = {
        ...formData,
        wantsUpdates: formData.wantsUpdates || false,
        consentToResearch: formData.consentToResearch || false,
        hasExhibited: formData.hasExhibited || false,
        collaborates: formData.collaborates || false,
        usesReferences: formData.usesReferences || false,
        monetizes: formData.monetizes || false,
        exhibitionSource: formData.hasExhibited ? formData.exhibitionSource : 'N/A'
      };

      formDataToSend.append('surveyData', JSON.stringify(surveyDataToSubmit));

      if (formData.audioIntroduction) {
        formDataToSend.append('audioIntroduction', formData.audioIntroduction);
      } else {
        setError('Please upload an audio introduction');
        return;
      }

      // Use the centralized API module for form submission
      await api.post('/api/survey/submit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Redirect to thank you page
      navigate('/thank-you');
    } catch (err) {
      setError('Error submitting survey. Please try again.');
      console.error(err);
    }
  };

  // Validation functions for each step
  const validateStep = (step) => {
    switch (step) {
      case 0: // Basic Profile
        return (
          formData.fullName.trim() !== '' &&
          formData.email.trim() !== '' &&
          formData.age.toString().trim() !== '' &&
          formData.country.trim() !== '' &&
          formData.primaryDiscipline.trim() !== '' &&
          formData.experienceYears.trim() !== ''
        );
      case 1: // Artistic Experience
        return (
          formData.background.trim().length >= 150 &&
          formData.training.trim() !== '' &&
          formData.mediums.length > 0
        );
      case 2: // Sharing & Community
        if (formData.hasExhibited && formData.exhibitionSource === '') {
          return false;
        }
        if (formData.collaborates && formData.collaborationDescription.trim().length < 150) {
          return false;
        }
        return true;
      case 3: // Creative Process
        return (
          formData.ideaGeneration.trim().length >= 150 &&
          formData.challenges.trim().length >= 150 &&
          formData.preferredCreationTime.trim().length >= 150 &&
          formData.emotionalState.trim().length >= 150 &&
          formData.moodInfluence.trim().length >= 150
        );
      case 4: // Career & Goals
        if (formData.monetizes && formData.monetizationMethods.length === 0) {
          return false;
        }
        return (
          formData.fiveYearGoal.trim().length >= 150 &&
          formData.platformSuggestion.trim().length >= 150
        );
      case 5: // Consent
        return formData.consentToResearch;
      default:
        return true;
    }
  };

  // Handle step navigation with validation
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      window.scrollTo(0, 0);
      setError('');
    } else {
      setError('Please complete all required fields and ensure text responses have at least 150 characters.');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo(0, 0);
    setError('');
  };

  // Define steps
  const steps = [
    'Basic Profile',
    'Artistic Experience',
    'Sharing & Community',
    'Creative Process',
    'Career & Goals',
    'Consent'
  ];

  // Discipline options
  const disciplines = [
    'Drawing',
    'Painting',
    'Photography',
    'Graphic Design',
    'Animation',
    'Digital Art',
    'Sculpture',
    'Interior Design',
    'Other'
  ];

  // Experience years options
  const experienceOptions = [
    'Less than 1 year',
    '1-3 years',
    '4-7 years',
    '8-10 years',
    'Over 10 years'
  ];

  // Medium options
  const mediumOptions = [
    'Pencil/Graphite',
    'Pen/Ink',
    'Charcoal',
    'Watercolor',
    'Acrylic',
    'Oil',
    'Digital (2D)',
    'Digital (3D)',
    'Photography',
    'Mixed Media',
    'Sculpture',
    'Printmaking',
    'Other'
  ];

  // Platform options
  const platformOptions = [
    'Instagram',
    'Behance',
    'DeviantArt',
    'ArtStation',
    'Twitter',
    'Facebook',
    'TikTok',
    'Personal Website',
    'Etsy',
    'Society6',
    'Other'
  ];

  // Exhibition source options
  const exhibitionOptions = [
    'Invited',
    'Applied',
    'Through a friend',
    'Online listing',
    'University',
    'Other',
    'N/A'
  ];

  // Monetization methods
  const monetizationOptions = [
    'Commissions',
    'Selling prints',
    'Freelance work',
    'Gallery sales',
    'Teaching',
    'NFTs',
    'Patreon/Subscriptions',
    'Merchandise',
    'Other'
  ];

  // Render loading state
  if (loading) {
    return (
      <Paper className="form-container">
        <Typography variant="h4" component="h1" className="form-title">
          Loading Survey...
        </Typography>
      </Paper>
    );
  }

  // Render error state
  if (!tokenValid && !loading) {
    return (
      <Paper className="form-container">
        <Typography variant="h4" component="h1" className="form-title">
          Access Error
        </Typography>

        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>

        <Typography paragraph>
          Please make sure you're using the correct link from your email. If your link has expired, you may need to request a new one.
        </Typography>
      </Paper>
    );
  }

  // Render form content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Basic Profile
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" className="form-subtitle" sx={{ mb: 3, fontWeight: 'medium' }}>
              Basic Artist Profile
            </Typography>

            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled
              sx={{ mb: 2 }}
            />

            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
              sx={{ mb: 2 }}
            />

            <TextField
              label="Age"
              variant="outlined"
              fullWidth
              margin="normal"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              inputProps={{ min: 18, max: 100 }}
              sx={{ mb: 2 }}
              error={error && formData.age.toString().trim() === ''}
              helperText={error && formData.age.toString().trim() === '' ? 'Age is required' : ''}
            />

            <TextField
              label="Country"
              variant="outlined"
              fullWidth
              margin="normal"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              error={error && formData.country.trim() === ''}
              helperText={error && formData.country.trim() === '' ? 'Country is required' : ''}
            />

            <FormControl fullWidth margin="normal" required sx={{ mb: 2 }} error={error && formData.primaryDiscipline.trim() === ''}>
              <InputLabel>Primary Artistic Discipline</InputLabel>
              <Select
                name="primaryDiscipline"
                value={formData.primaryDiscipline}
                onChange={handleChange}
                label="Primary Artistic Discipline"
              >
                {disciplines.map((discipline) => (
                  <MenuItem key={discipline} value={discipline}>
                    {discipline}
                  </MenuItem>
                ))}
              </Select>
              {error && formData.primaryDiscipline.trim() === '' && (
                <Typography color="error" variant="caption" sx={{ mt: 1, ml: 2 }}>
                  Please select your primary discipline
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth margin="normal" required sx={{ mb: 2 }} error={error && formData.experienceYears.trim() === ''}>
              <InputLabel>Years of Experience</InputLabel>
              <Select
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                label="Years of Experience"
              >
                {experienceOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {error && formData.experienceYears.trim() === '' && (
                <Typography color="error" variant="caption" sx={{ mt: 1, ml: 2 }}>
                  Please select your experience level
                </Typography>
              )}
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom required>
                Audio Introduction *
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Please provide a brief audio introduction in English about your career or hobby as an artist
              </Typography>
              <input
                accept=".mp3,.wav,.ogg,.m4a"
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData(prev => ({
                    ...prev,
                    audioIntroduction: file
                  }));
                }}
                style={{ display: 'none' }}
                id="audio-file-input"
              />
              <label htmlFor="audio-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  sx={{ mr: 2 }}
                >
                  Upload Audio
                </Button>
              </label>
              {formData.audioIntroduction && (
                <Typography variant="body2">
                  Selected file: {formData.audioIntroduction.name}
                </Typography>
              )}
              {error && !formData.audioIntroduction && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  Please upload an audio introduction
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 1: // Artistic Experience
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" className="form-subtitle" sx={{ mb: 3, fontWeight: 'medium' }}>
              Artistic Experience
            </Typography>

            <TextField
              label="How did you first get involved in your chosen artistic field?"
              variant="outlined"
              fullWidth
              margin="normal"
              name="background"
              value={formData.background}
              onChange={handleChange}
              required
              multiline
              rows={4}
              sx={{ mb: 3 }}
              error={error && formData.background.trim() === ''}
              helperText={error && formData.background.trim() === '' ? 'This field is required' : `${formData.background.length}/150 characters`}
              inputProps={{ maxLength: 150 }}
            />

            <FormControl component="fieldset" margin="normal" required sx={{ mb: 3, display: 'block' }} error={error && formData.training.trim() === ''}>
              <FormLabel component="legend" sx={{ mb: 1 }}>Do you consider yourself:</FormLabel>
              <RadioGroup
                name="training"
                value={formData.training}
                onChange={handleChange}
              >
                <FormControlLabel value="Self-taught" control={<Radio />} label="Self-taught" />
                <FormControlLabel value="Formally trained" control={<Radio />} label="Formally trained" />
                <FormControlLabel value="Mix" control={<Radio />} label="A mix of both" />
              </RadioGroup>
              {error && formData.training.trim() === '' && (
                <Typography color="error" variant="caption">
                  Please select an option
                </Typography>
              )}
            </FormControl>

            <FormControl component="fieldset" margin="normal" required sx={{ mb: 3, display: 'block' }} error={error && formData.mediums.length === 0}>
              <FormLabel component="legend" sx={{ mb: 1 }}>What tools or mediums do you primarily use?</FormLabel>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>(Select all that apply)</Typography>
              <FormGroup>
                {mediumOptions.map((medium) => (
                  <FormControlLabel
                    key={medium}
                    control={
                      <Checkbox
                        checked={formData.mediums.includes(medium)}
                        onChange={() => handleMultiCheckboxChange('mediums', medium)}
                      />
                    }
                    label={medium}
                  />
                ))}
              </FormGroup>
              {error && formData.mediums.length === 0 && (
                <Typography color="error" variant="caption">
                  Please select at least one medium
                </Typography>
              )}
            </FormControl>

            <Box sx={{ mt: 4 }}>
              <Typography gutterBottom>
                How many hours per week do you typically spend on artistic work?
              </Typography>
              <Slider
                value={formData.hoursPerWeek}
                onChange={(e, newValue) => handleSliderChange('hoursPerWeek', newValue)}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={40}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">0 hours</Typography>
                <Typography variant="body2">40+ hours</Typography>
              </Box>
            </Box>
          </Box>
        );

      case 2: // Sharing & Community
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" className="form-subtitle" sx={{ mb: 3, fontWeight: 'medium' }}>
              Sharing & Community
            </Typography>

            <FormControl component="fieldset" margin="normal" sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1 }}>Do you share your work online? If so, which platforms?</FormLabel>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>(Select all that apply)</Typography>
              <FormGroup>
                {platformOptions.map((platform) => (
                  <FormControlLabel
                    key={platform}
                    control={
                      <Checkbox
                        checked={formData.platforms.includes(platform)}
                        onChange={() => handleMultiCheckboxChange('platforms', platform)}
                      />
                    }
                    label={platform}
                  />
                ))}
              </FormGroup>
            </FormControl>

            {formData.platforms.length > 0 && (
              <TextField
                label="Share links to your work (if public)"
                placeholder="Add your social media or portfolio links here"
                variant="outlined"
                fullWidth
                margin="normal"
                name="platformLinks"
                value={formData.platformLinks}
                onChange={handleChange}
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />
            )}

            <FormControl component="fieldset" margin="normal" required sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1 }}>Have you ever exhibited your work (online or in-person)?</FormLabel>
              <RadioGroup
                name="hasExhibited"
                value={formData.hasExhibited.toString()}
                onChange={(e) => setFormData({
                  ...formData,
                  hasExhibited: e.target.value === 'true'
                })}
              >
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            {formData.hasExhibited && (
              <FormControl fullWidth margin="normal" required sx={{ mb: 3 }} error={error && formData.hasExhibited && formData.exhibitionSource === ''}>
                <InputLabel>How did you find the opportunity?</InputLabel>
                <Select
                  name="exhibitionSource"
                  value={formData.exhibitionSource}
                  onChange={handleChange}
                  label="How did you find the opportunity?"
                >
                  {exhibitionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {error && formData.hasExhibited && formData.exhibitionSource === '' && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, ml: 2 }}>
                    Please select how you found the opportunity
                  </Typography>
                )}
              </FormControl>
            )}

            <FormControl component="fieldset" margin="normal" required sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1 }}>Do you collaborate with other artists or creatives?</FormLabel>
              <RadioGroup
                name="collaborates"
                value={formData.collaborates.toString()}
                onChange={(e) => setFormData({
                  ...formData,
                  collaborates: e.target.value === 'true'
                })}
              >
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            {formData.collaborates && (
              <TextField
                label="Please describe a collaboration you found especially meaningful"
                variant="outlined"
                fullWidth
                margin="normal"
                name="collaborationDescription"
                value={formData.collaborationDescription}
                onChange={handleChange}
                multiline
                rows={3}
                sx={{ mb: 2 }}
                error={error && formData.collaborates && formData.collaborationDescription.trim() === ''}
                helperText={error && formData.collaborates && formData.collaborationDescription.trim() === '' ? 'Please describe your collaboration' : `${formData.collaborationDescription.length}/150 characters`}
                inputProps={{ maxLength: 150 }}
              />
            )}
          </Box>
        );

      case 3: // Creative Process
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" className="form-subtitle" sx={{ mb: 3, fontWeight: 'medium' }}>
              Creative Process
            </Typography>

            <TextField
              label="How do you usually come up with new ideas or concepts for your work?"
              variant="outlined"
              fullWidth
              margin="normal"
              name="ideaGeneration"
              value={formData.ideaGeneration}
              onChange={handleChange}
              required
              multiline
              rows={4}
              sx={{ mb: 3 }}
              error={error && formData.ideaGeneration.trim() === ''}
              helperText={error && formData.ideaGeneration.trim() === '' ? 'This field is required' : `${formData.ideaGeneration.length}/150 characters`}
              inputProps={{ maxLength: 150 }}
            />

            <FormControl component="fieldset" margin="normal" required sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1 }}>Do you use references or moodboards?</FormLabel>
              <RadioGroup
                name="usesReferences"
                value={formData.usesReferences.toString()}
                onChange={(e) => setFormData({
                  ...formData,
                  usesReferences: e.target.value === 'true'
                })}
              >
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            <TextField
              label="What is the most challenging part of your artistic process?"
              variant="outlined"
              fullWidth
              margin="normal"
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              required
              multiline
              rows={4}
              sx={{ mb: 3 }}
              error={error && formData.challenges.trim() === ''}
              helperText={error && formData.challenges.trim() === '' ? 'This field is required' : `${formData.challenges.length}/150 characters`}
              inputProps={{ maxLength: 150 }}
            />

            <TextField
              label="When do you prefer to create art? Describe your ideal creative time and environment."
              variant="outlined"
              fullWidth
              margin="normal"
              name="preferredCreationTime"
              value={formData.preferredCreationTime}
              onChange={handleChange}
              required
              multiline
              rows={4}
              sx={{ mb: 3 }}
              error={error && formData.preferredCreationTime.trim() === ''}
              helperText={error && formData.preferredCreationTime.trim() === '' ? 'This field is required' : `${formData.preferredCreationTime.length}/150 characters`}
              inputProps={{ maxLength: 150 }}
            />

            <TextField
              label="How do you feel emotionally when creating art? Describe your typical emotional state during the creative process."
              variant="outlined"
              fullWidth
              margin="normal"
              name="emotionalState"
              value={formData.emotionalState}
              onChange={handleChange}
              required
              multiline
              rows={4}
              sx={{ mb: 3 }}
              error={error && formData.emotionalState.trim() === ''}
              helperText={error && formData.emotionalState.trim() === '' ? 'This field is required' : `${formData.emotionalState.length}/150 characters`}
              inputProps={{ maxLength: 150 }}
            />

            <TextField
              label="How do different moods influence your artistic style? Give specific examples of how your art changes with your emotional state."
              variant="outlined"
              fullWidth
              margin="normal"
              name="moodInfluence"
              value={formData.moodInfluence}
              onChange={handleChange}
              required
              multiline
              rows={4}
              sx={{ mb: 2 }}
              error={error && formData.moodInfluence.trim() === ''}
              helperText={error && formData.moodInfluence.trim() === '' ? 'This field is required' : `${formData.moodInfluence.length}/150 characters`}
              inputProps={{ maxLength: 150 }}
            />
          </Box>
        );

      case 4: // Career & Goals
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" className="form-subtitle" sx={{ mb: 3, fontWeight: 'medium' }}>
              Career & Goals
            </Typography>

            <FormControl component="fieldset" margin="normal" required sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1 }}>Do you monetize your work?</FormLabel>
              <RadioGroup
                name="monetizes"
                value={formData.monetizes.toString()}
                onChange={(e) => setFormData({
                  ...formData,
                  monetizes: e.target.value === 'true'
                })}
              >
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            {formData.monetizes && (
              <FormControl component="fieldset" margin="normal" required sx={{ mb: 3, display: 'block' }} error={error && formData.monetizes && formData.monetizationMethods.length === 0}>
                <FormLabel component="legend" sx={{ mb: 1 }}>How do you monetize your work? (Select all that apply)</FormLabel>
                <FormGroup>
                  {monetizationOptions.map((method) => (
                    <FormControlLabel
                      key={method}
                      control={
                        <Checkbox
                          checked={formData.monetizationMethods.includes(method)}
                          onChange={() => handleMultiCheckboxChange('monetizationMethods', method)}
                        />
                      }
                      label={method}
                    />
                  ))}
                </FormGroup>
                {error && formData.monetizes && formData.monetizationMethods.length === 0 && (
                  <Typography color="error" variant="caption">
                    Please select at least one monetization method
                  </Typography>
                )}
              </FormControl>
            )}

            <TextField
              label="What is your biggest goal as an artist in the next 5 years?"
              variant="outlined"
              fullWidth
              margin="normal"
              name="fiveYearGoal"
              value={formData.fiveYearGoal}
              onChange={handleChange}
              required
              multiline
              rows={3}
              sx={{ mb: 3 }}
              error={error && formData.fiveYearGoal.trim() === ''}
              helperText={error && formData.fiveYearGoal.trim() === '' ? 'This field is required' : `${formData.fiveYearGoal.length}/150 characters`}
              inputProps={{ maxLength: 150 }}
            />

            <TextField
              label="What kind of platform would genuinely help you grow or showcase your work?"
              variant="outlined"
              fullWidth
              margin="normal"
              name="platformSuggestion"
              value={formData.platformSuggestion}
              onChange={handleChange}
              required
              multiline
              rows={4}
              sx={{ mb: 2 }}
              error={error && formData.platformSuggestion.trim() === ''}
              helperText={error && formData.platformSuggestion.trim() === '' ? 'This field is required' : `${formData.platformSuggestion.length}/150 characters - This information will help inform the development of new tools for artists`}
              inputProps={{ maxLength: 150 }}
            />
          </Box>
        );

      case 5: // Consent
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" className="form-subtitle" sx={{ mb: 3, fontWeight: 'medium' }}>
              Consent & Final Steps
            </Typography>

            <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Research Consent
              </Typography>
              <Typography paragraph>
                By checking the box below, you agree that your responses may be used for academic research purposes as part of a Master's thesis project at the Technical University of Berlin. All data will be anonymized in any published results.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.consentToResearch}
                    onChange={(e) => setFormData({
                      ...formData,
                      consentToResearch: e.target.checked
                    })}
                    required
                  />
                }
                label="I consent to my responses being used for academic research"
              />
              {error && !formData.consentToResearch && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  You must consent to research to submit the survey
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.wantsUpdates}
                    onChange={(e) => setFormData({
                      ...formData,
                      wantsUpdates: e.target.checked
                    })}
                  />
                }
                label="I would like to receive updates about the results of this research and future platform developments"
              />
            </Box>

            <Typography paragraph color="text.secondary">
              Thank you for taking the time to complete this survey. Your insights are invaluable to our research and will help shape the development of better tools for artists.
            </Typography>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper className="form-container" sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" component="h1" className="form-title" sx={{ mb: 2, textAlign: 'center' }}>
        Art Survey for Graduate Research
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 4 }} className="survey-token-info">
        <Typography variant="body1">
          Welcome, {userData?.name}! Your access token is valid. Please complete all sections of the survey.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider sx={{ mb: 4 }} />

      <form onSubmit={handleSubmit}>
        <Box sx={{ minHeight: '400px' }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!formData.consentToResearch}
              >
                Submit Survey
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                color="primary"
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default Survey;