const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },

  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Please provide a valid email address',
    },
  },

  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    required: [function () { return !this.googleId; }, 'Password is required'],
  },

  googleId: {
    type: String,
    sparse: true,
  },

  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  role: {
    type: String,
    enum: {
      values: ['student', 'lecturer', 'admin'],
      message: '{VALUE} is not a valid role. Must be student, lecturer, or admin',
    },
    required: [true, 'Role is required'],
    default: 'student',
  },

  // Student-specific
  matricNumber: {
    type: String,
    sparse: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function (v) {
        if (this.role === 'student' && v) {
          return /^[A-Z]{3}\/[A-Z]{3}\/\d{2}\/\d{2,}$/.test(v);
        }
        return true;
      },
      message: 'Matric number format should be like VUG/CSC/22/7410',
    },
  },

  level: {
    type: Number,
    enum: {
      values: [100, 200, 300, 400, 500, 600],
      message: '{VALUE} is not a valid level',
    },
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },

  // Lecturer-specific
  staffId: {
    type: String,
    sparse: true,
    trim: true,
    uppercase: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  resetPasswordToken: { type: String, select: false },
  resetPasswordExpiry: { type: Date, select: false },
}, {
  timestamps: true,
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findOrCreateOAuthUser = async function (profile, provider) {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new Error('No email returned from Google');

  // Return existing user matched by googleId
  let user = await this.findOne({ googleId: profile.id });
  if (user) return user;

  // Link Google to an existing local account with the same email
  user = await this.findOne({ email });
  if (user) {
    user.googleId = profile.id;
    user.provider = provider;
    await user.save();
    return user;
  }

  // Create a brand-new OAuth user (defaults to student role)
  user = await this.create({
    firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
    lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
    email,
    googleId: profile.id,
    provider,
    role: 'student',
  });
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
