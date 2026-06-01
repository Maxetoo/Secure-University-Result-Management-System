const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{3}\d{3}$/.test(v);
      },
      message: 'Course code format should be like CSC304'
    }
  },
  
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    minlength: [3, 'Course title must be at least 3 characters'],
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  
  level: {
    type: Number,
    required: [true, 'Level is required'],
    enum: {
      values: [100, 200, 300, 400, 500, 600],
      message: '{VALUE} is not a valid level'
    }
  },
  
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ courseCode: 1 });
courseSchema.index({ department: 1, level: 1 });
courseSchema.index({ lecturer: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;