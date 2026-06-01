const { verifyAccessToken } = require('../helpers/jwtHelper');
const CustomError = require('../errors');

// Reads Bearer token from Authorization header
const authentication = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError.UnauthorizedError('Authentication invalid — no token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new CustomError.UnauthorizedError('Authentication invalid — token expired or malformed');
  }
};

// Student only
const studentAuthorization = (req, res, next) => {
  if (req.user.role !== 'student') {
    throw new CustomError.ForbiddenError('Access restricted to students');
  }
  next();
};

// Lecturer only
const lecturerAuthorization = (req, res, next) => {
  if (req.user.role !== 'lecturer') {
    throw new CustomError.ForbiddenError('Access restricted to lecturers');
  }
  next();
};

// Admin only
const adminAuthorization = (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new CustomError.ForbiddenError('Access restricted to administrators');
  }
  next();
};

// Lecturer or admin
const lecturerOrAdminAuthorization = (req, res, next) => {
  if (!['lecturer', 'admin'].includes(req.user.role)) {
    throw new CustomError.ForbiddenError('Access restricted to lecturers and administrators');
  }
  next();
};

module.exports = {
  authentication,
  studentAuthorization,
  lecturerAuthorization,
  adminAuthorization,
  lecturerOrAdminAuthorization,
};
