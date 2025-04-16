const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SurveySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic Artist Profile
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  primaryDiscipline: {
    type: String,
    enum: ['Drawing', 'Painting', 'Photography', 'Graphic Design', 'Animation', 'Digital Art', 'Sculpture', 'Other'],
    required: true
  },
  experienceYears: {
    type: String,
    enum: ['Less than 1 year', '1-3 years', '4-7 years', '8-10 years', 'Over 10 years'],
    required: true
  },

  // Artistic Experience
  background: {
    type: String,
    required: true,
    minlength: 150,
    maxlength: 300
  },
  training: {
    type: String,
    enum: ['Self-taught', 'Formally trained', 'Mix'],
    required: true
  },
  mediums: {
    type: [String],
    required: true
  },
  hoursPerWeek: {
    type: Number,
    required: true
  },

  // Sharing & Community
  platforms: {
    type: [String],
    default: []
  },
  platformLinks: {
    type: String,
    maxlength: 300
  },
  hasExhibited: {
    type: Boolean,
    required: true
  },
  exhibitionSource: {
    type: String,
    enum: ['Invited', 'Applied', 'Through a friend', 'Online listing', 'University', 'Other', 'N/A']
  },
  collaborates: {
    type: Boolean,
    required: true
  },
  collaborationDescription: {
    type: String,
    minlength: 150,
    maxlength: 300
  },

  // Creative Process
  ideaGeneration: {
    type: String,
    required: true,
    minlength: 150,
    maxlength: 300
  },
  usesReferences: {
    type: Boolean,
    required: true
  },
  challenges: {
    type: String,
    required: true,
    minlength: 150,
    maxlength: 300
  },
  preferredCreationTime: {
    type: String,
    required: true,
    minlength: 150,
    maxlength: 300
  },
  emotionalState: {
    type: String,
    required: true,
    minlength: 150,
    maxlength: 300
  },
  moodInfluence: {
    type: String,
    required: true,
    minlength: 150,
    maxlength: 300
  },

  // Career & Goals
  monetizes: {
    type: Boolean,
    required: true
  },
  audioIntroduction: {
    type: String,
    required: true
  },
  monetizationMethods: {
    type: [String],
    default: []
  },
  fiveYearGoal: {
    type: String,
    required: true,
    minlength: 150,
    maxlength: 300
  },
  platformSuggestion: {
    type: String,
    required: true,
    minlength: 150,
    maxlength: 300
  },

  // Consent
  consentToResearch: {
    type: Boolean,
    required: true
  },
  wantsUpdates: {
    type: Boolean,
    required: true
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Survey', SurveySchema);