const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// @route   GET api/survey/audio/:filename
// @desc    Get audio file by filename
// @access  Public
router.get('/audio/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', 'audio', req.params.filename);
  if (fs.existsSync(filePath)) {
    // Set appropriate content type based on file extension
    const ext = path.extname(req.params.filename).toLowerCase();
    let contentType = 'audio/mpeg'; // Default to MP3

    if (ext === '.wav') contentType = 'audio/wav';
    else if (ext === '.ogg') contentType = 'audio/ogg';
    else if (ext === '.m4a') contentType = 'audio/mp4';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } else {
    res.status(404).json({ msg: 'Audio file not found' });
  }
});

// Get base URL for file serving
const getBaseUrl = () => {
  return process.env.NODE_ENV === 'production'
    ? 'https://art-app.onrender.com'
    : `http://localhost:${process.env.PORT || 5000}`;
};

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'audio');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log("File MIME type:", file.mimetype);
    console.log("File extension:", path.extname(file.originalname).toLowerCase());

    // Check file extension
    const validExtensions = /\.(mp3|wav|ogg|m4a)$/i;
    const extname = validExtensions.test(path.extname(file.originalname).toLowerCase());

    // Check MIME type - MP3 files can come with various MIME types
    const validMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/x-m4a',
      'audio/x-mp3',
      'audio/mp4',
      'audio/aac',
      'application/octet-stream' // Some browsers/systems send binary types for audio files
    ];

    // Accept file if either the extension or MIME type is valid
    if (extname || validMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    console.log("File rejected: Invalid file type");
    cb(new Error('Only audio files are allowed! Supported formats: MP3, WAV, OGG, M4A'));
  }
});

// Models
const Survey = require('../models/Survey');
const User = require('../models/User');

// Middleware
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   POST api/survey/submit
// @desc    Submit a survey response
// @access  Public (with valid token)
router.post('/submit', upload.single('audioIntroduction'), async (req, res) => {
  try {
    const { token, surveyData } = req.body;
    const surveyDataObj = typeof surveyData === 'string' ? JSON.parse(surveyData) : surveyData;

    // Verify token is valid
    const user = await User.findOne({
      accessToken: token,
      accessTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      // Remove uploaded file if token is invalid
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({ msg: 'Invalid or expired token' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'Audio file is required' });
    }

    // Clean up the data before saving
    const cleanedData = { ...surveyDataObj };

    // If user doesn't collaborate, remove the collaborationDescription requirement
    if (cleanedData.collaborates === false) {
      cleanedData.collaborationDescription = undefined; // This will be ignored by Mongoose
    }

    // Create new survey response
    const survey = new Survey({
      user: user._id,
      ...cleanedData,
      audioIntroduction: `${getBaseUrl()}/api/survey/audio/${path.basename(req.file.path)}`
    });

    await survey.save();

    res.json({ msg: 'Survey submitted successfully', surveyId: survey._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/survey
// @desc    Get all survey responses (admin only)
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const surveys = await Survey.find()
      .sort({ submittedAt: -1 })
      .populate('user', ['name', 'email']);

    res.json(surveys);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/survey/check-submission/:userId
// @desc    Check if a user has already submitted a survey
// @access  Public
router.get('/check-submission/:userId', async (req, res) => {
  try {
    const survey = await Survey.findOne({ user: req.params.userId });

    if (survey) {
      return res.json({ hasSubmitted: true, submittedAt: survey.submittedAt });
    }

    res.json({ hasSubmitted: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/survey/:id
// @desc    Get survey by ID
// @access  Private/Admin
router.get('/:id', [auth, admin], async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('user', ['name', 'email']);

    if (!survey) {
      return res.status(404).json({ msg: 'Survey not found' });
    }

    res.json(survey);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Survey not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/survey/export/csv
// @desc    Export all surveys as CSV
// @access  Private/Admin
router.get('/export/csv', [auth, admin], async (req, res) => {
  try {
    const surveys = await Survey.find()
      .sort({ submittedAt: -1 })
      .populate('user', ['name', 'email']);

    // Create CSV header
    let csv = 'Submission Date,Full Name,Email,Age,Country,Primary Discipline,Experience Years,College,Background,Training,Mediums,Hours Per Week,Art Styles,Major Influences,Platforms,Platform Links,Has Exhibited,Exhibition Source,Collaborates,Collaboration Description,Feedback Sources,Community Participation,Idea Generation,Uses References,Challenges,Preferred Creation Time,Emotional State,Mood Influence,Creative Rituals,Tools Used,Work Environment,Music Preference,Monetizes,Monetization Methods,Five Year Goal,Platform Suggestion,Career Challenges,Skills To Improve,Consent To Research,Wants Updates\n';

    // Add each survey as a row
    surveys.forEach(survey => {
      const row = [
        survey.submittedAt.toISOString(),
        survey.fullName,
        survey.email,
        survey.age,
        survey.country,
        survey.primaryDiscipline,
        survey.experienceYears,
        `"${survey.college ? survey.college.replace(/"/g, '""') : ''}"`,
        `"${survey.background ? survey.background.replace(/"/g, '""') : ''}"`,
        survey.training,
        `"${survey.mediums.join(', ')}"`,
        survey.hoursPerWeek,
        `"${survey.artStyle ? survey.artStyle.join(', ') : ''}"`,
        `"${survey.majorInfluences ? survey.majorInfluences.join(', ') : ''}"`,
        `"${survey.platforms.join(', ')}"`,
        `"${survey.platformLinks ? survey.platformLinks.replace(/"/g, '""') : ''}"`,
        survey.hasExhibited,
        survey.exhibitionSource || 'N/A',
        survey.collaborates,
        survey.collaborationDescription ? `"${survey.collaborationDescription.replace(/"/g, '""')}"` : '',
        `"${survey.feedbackSource ? survey.feedbackSource.join(', ') : ''}"`,
        `"${survey.communityParticipation ? survey.communityParticipation.join(', ') : ''}"`,
        `"${survey.ideaGeneration ? survey.ideaGeneration.replace(/"/g, '""') : ''}"`,
        survey.usesReferences,
        `"${survey.challenges ? survey.challenges.replace(/"/g, '""') : ''}"`,
        `"${survey.preferredCreationTime ? survey.preferredCreationTime.replace(/"/g, '""') : ''}"`,
        `"${survey.emotionalState ? survey.emotionalState.replace(/"/g, '""') : ''}"`,
        `"${survey.moodInfluence ? survey.moodInfluence.replace(/"/g, '""') : ''}"`,
        `"${survey.creativeRituals ? survey.creativeRituals.join(', ') : ''}"`,
        `"${survey.toolsUsed ? survey.toolsUsed.join(', ') : ''}"`,
        survey.workEnvironment || '',
        survey.musicPreference || '',
        survey.monetizes,
        `"${survey.monetizationMethods.join(', ')}"`,
        `"${survey.fiveYearGoal ? survey.fiveYearGoal.replace(/"/g, '""') : ''}"`,
        `"${survey.platformSuggestion ? survey.platformSuggestion.replace(/"/g, '""') : ''}"`,
        `"${survey.careerChallenges ? survey.careerChallenges.join(', ') : ''}"`,
        `"${survey.skillsToImprove ? survey.skillsToImprove.join(', ') : ''}"`,
        survey.consentToResearch,
        survey.wantsUpdates
      ];

      csv += row.join(',') + '\n';
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=survey-responses.csv');

    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;