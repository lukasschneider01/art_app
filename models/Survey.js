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
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
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
  college: {
    type: String
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
  artStyle: {
    type: [String],
    default: []
  },
  majorInfluences: {
    type: [String],
    default: []
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
    minlength: function () {
      return this.collaborates ? 150 : 0;
    },
    maxlength: 300,
    required: function () {
      return this.collaborates;
    }
  },
  feedbackSource: {
    type: [String],
    default: []
  },
  communityParticipation: {
    type: [String],
    default: []
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
  creativeRituals: {
    type: [String],
    default: []
  },
  toolsUsed: {
    type: [String],
    default: []
  },
  workEnvironment: {
    type: String,
    enum: ['Home studio', 'Shared workspace', 'Outdoors', 'On-the-go', 'Office', 'Other']
  },
  musicPreference: {
    type: String,
    enum: ['Always listen to music', 'Sometimes listen to music', 'Prefer silence', 'Ambient noise', 'Podcasts/Audiobooks', 'Varies by project']
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
  careerChallenges: {
    type: [String],
    default: []
  },
  skillsToImprove: {
    type: [String],
    default: []
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