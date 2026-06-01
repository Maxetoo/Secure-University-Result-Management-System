const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
  },

  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: {
      values: ['First', 'Second'],
      message: 'Semester must be First or Second',
    },
  },

  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}\/\d{4}$/, 'Academic year format should be like 2023/2024'],
  },

  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100'],
  },

  grade: {
    type: String,
    enum: {
      values: ['A', 'B', 'C', 'D', 'E', 'F'],
      message: '{VALUE} is not a valid grade',
    },
  },

  // Optional Cloudinary document URL (result sheet upload)
  documentUrl: {
    type: String,
    trim: true,
  },

  documentPublicId: {
    type: String,
    trim: true,
  },

  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters'],
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required'],
  },

  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Unique result per student-course-semester-year
resultSchema.index({ student: 1, course: 1, semester: 1, academicYear: 1 }, { unique: true });
resultSchema.index({ course: 1 });
resultSchema.index({ uploadedBy: 1 });

// Auto-compute grade from score before save
resultSchema.pre('save', function () {
  if (this.isModified('score')) {
    const s = this.score;
    if (s >= 70) this.grade = 'A';
    else if (s >= 60) this.grade = 'B';
    else if (s >= 50) this.grade = 'C';
    else if (s >= 45) this.grade = 'D';
    else if (s >= 40) this.grade = 'E';
    else this.grade = 'F';
  }
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
