const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const CustomError = require('../errors');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../helpers/jwtHelper');

const buildTokenPayload = (user) => ({
  userId: user._id,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
});

// POST /api/register
const register = async (req, res) => {
  const {
    firstName, lastName, email, password, role,
    matricNumber, level, departmentCode,
    staffId,
  } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    throw new CustomError.BadRequestError('firstName, lastName, email, password, and role are required');
  }

  const validRoles = ['student', 'lecturer'];
  if (!validRoles.includes(role)) {
    throw new CustomError.BadRequestError('role must be student or lecturer');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new CustomError.BadRequestError('An account with that email already exists');
  }

  const userData = { firstName, lastName, email, password, role };

  if (role === 'student') {
    if (!matricNumber || !level) {
      throw new CustomError.BadRequestError('matricNumber and level are required for students');
    }
    userData.matricNumber = matricNumber.toUpperCase();
    userData.level = parseInt(level, 10);

    if (departmentCode) {
      const { Department } = require('../models');
      const dept = await Department.findOne({ code: departmentCode.toUpperCase() });
      if (!dept) throw new CustomError.NotFoundError('Department not found');
      userData.department = dept._id;
    }
  }

  if (role === 'lecturer') {
    if (!staffId) {
      throw new CustomError.BadRequestError('staffId is required for lecturers');
    }
    userData.staffId = staffId.toUpperCase();

    if (departmentCode) {
      const { Department } = require('../models');
      const dept = await Department.findOne({ code: departmentCode.toUpperCase() });
      if (!dept) throw new CustomError.NotFoundError('Department not found');
      userData.department = dept._id;
    }
  }

  const user = await User.create(userData);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Account created successfully',
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
};

// POST /api/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new CustomError.UnauthorizedError('Invalid credentials');
  }

  if (user.googleId && !user.password) {
    throw new CustomError.BadRequestError('This account uses Google sign-in. Please use "Continue with Google".');
  }

  const isCorrect = await user.comparePassword(password);
  if (!isCorrect) {
    throw new CustomError.UnauthorizedError('Invalid credentials');
  }

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ userId: user._id });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
};

// POST /api/auth/refresh
const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new CustomError.BadRequestError('refreshToken is required');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new CustomError.UnauthorizedError('Refresh token is invalid or expired');
  }

  // Issue a new short-lived access token
  // Re-fetch user to get current role in case it changed
  User.findById(payload.userId).then((user) => {
    if (!user || !user.isActive) {
      throw new CustomError.UnauthorizedError('User not found or inactive');
    }
    const newAccessToken = signAccessToken(buildTokenPayload(user));
    res.status(StatusCodes.OK).json({ success: true, accessToken: newAccessToken });
  });
};

// GET /api/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId)
    .populate('department', 'name code')
    .select('-password');

  if (!user) {
    throw new CustomError.NotFoundError('User not found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      ...(user.role === 'student' && { matricNumber: user.matricNumber, level: user.level }),
      ...(user.role === 'lecturer' && { staffId: user.staffId }),
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
};

// POST /api/auth/logout  (stateless — client discards tokens; endpoint provided for completeness)
const logout = (req, res) => {
  res.status(StatusCodes.OK).json({ success: true, message: 'Logged out successfully' });
};

// PATCH /api/auth/update-password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new CustomError.BadRequestError('currentPassword and newPassword are required');
  }

  if (newPassword.length < 8) {
    throw new CustomError.BadRequestError('New password must be at least 8 characters');
  }

  const user = await User.findById(req.user.userId).select('+password');
  if (!user) throw new CustomError.NotFoundError('User not found');

  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect) throw new CustomError.UnauthorizedError('Current password is incorrect');

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, message: 'Password updated successfully' });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) throw new CustomError.BadRequestError('Email is required');

  const user = await User.findOne({ email });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    // In production: send reset_url via email here
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'If that email exists, a password reset link has been sent.',
  });
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    throw new CustomError.BadRequestError('token, newPassword, and confirmPassword are required');
  }

  if (newPassword !== confirmPassword) {
    throw new CustomError.BadRequestError('Passwords do not match');
  }

  if (newPassword.length < 8) {
    throw new CustomError.BadRequestError('Password must be at least 8 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) throw new CustomError.BadRequestError('Invalid or expired reset token');

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, message: 'Password reset successfully. You can now log in.' });
};

// POST /api/users/create-admin  (admin only)
const createAdmin = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new CustomError.BadRequestError('firstName, lastName, email, and password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new CustomError.BadRequestError('An account with that email already exists');
  }

  const user = await User.create({ firstName, lastName, email, password, role: 'admin' });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Admin account created successfully',
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  getProfile,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
  createAdmin,
};
