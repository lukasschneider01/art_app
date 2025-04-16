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
    res.sendFile(filePath);
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
    // Check file extension
    const validExtensions = /mp3|wav|ogg|m4a/;
    const extname = validExtensions.test(path.extname(file.originalname).toLowerCase());

    // Check MIME type - include audio/mpeg for MP3 files
    const validMimeTypes = /audio\/mpeg|audio\/mp3|audio\/wav|audio\/ogg|audio\/m4a/;
    const mimetype = validMimeTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only audio files are allowed!'));
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

    // Create new survey response
    const survey = new Survey({
      user: user._id,
      ...surveyDataObj,
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
    let csv = 'Submission Date,Full Name,Email,Age,Country,Primary Discipline,Experience Years,Background,Training,Mediums,Hours Per Week,Platforms,Has Exhibited,Exhibition Source,Collaborates,Collaboration Description,Idea Generation,Uses References,Challenges,Preferred Creation Time,Emotional State,Mood Influence,Monetizes,Monetization Methods,Five Year Goal,Platform Suggestion,Consent To Research,Wants Updates\n';

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
        `"${survey.background ? survey.background.replace(/"/g, '""') : ''}"`,
        survey.training,
        `"${survey.mediums.join(', ')}"`,
        survey.hoursPerWeek,
        `"${survey.platforms.join(', ')}"`,
        survey.hasExhibited,
        survey.exhibitionSource || 'N/A',
        survey.collaborates,
        survey.collaborationDescription ? `"${survey.collaborationDescription.replace(/"/g, '""')}"` : '',
        `"${survey.ideaGeneration ? survey.ideaGeneration.replace(/"/g, '""') : ''}"`,
        survey.usesReferences,
        `"${survey.challenges ? survey.challenges.replace(/"/g, '""') : ''}"`,
        `"${survey.preferredCreationTime ? survey.preferredCreationTime.replace(/"/g, '""') : ''}"`,
        `"${survey.emotionalState ? survey.emotionalState.replace(/"/g, '""') : ''}"`,
        `"${survey.moodInfluence ? survey.moodInfluence.replace(/"/g, '""') : ''}"`,
        survey.monetizes,
        `"${survey.monetizationMethods.join(', ')}"`,
        `"${survey.fiveYearGoal ? survey.fiveYearGoal.replace(/"/g, '""') : ''}"`,
        `"${survey.platformSuggestion ? survey.platformSuggestion.replace(/"/g, '""') : ''}"`,
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