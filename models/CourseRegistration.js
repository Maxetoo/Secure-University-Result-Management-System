const mongoose = require('mongoose');

// Tracks manual course registrations — for retakes or cross-level courses
const courseRegistrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  // 'manual' = student explicitly registered (retake / cross-level)
  registrationType: {
    type: String,
    enum: ['manual'],
    default: 'manual'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  droppedAt: {
    type: Date
  }

}, { timestamps: true });

// One active registration per student per course
courseRegistrationSchema.index({ student: 1, course: 1 }, { unique: true });
courseRegistrationSchema.index({ student: 1, isActive: 1 });

const CourseRegistration = mongoose.model('CourseRegistration', courseRegistrationSchema);

module.exports = CourseRegistration;
