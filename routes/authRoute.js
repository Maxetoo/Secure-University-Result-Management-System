const express = require('express');
const AuthRoute = express.Router();
const passport = require('../configs/passport');

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new student or lecturer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/RegisterStudentBody'
 *               - $ref: '#/components/schemas/RegisterLecturerBody'
 *           examples:
 *             student:
 *               summary: Student registration
 *               value:
 *                 firstName: John
 *                 lastName: Doe
 *                 email: john.doe@example.com
 *                 password: password123
 *                 role: student
 *                 matricNumber: VUG/CSC/22/7410
 *                 level: 200
 *                 departmentCode: CSC
 *             lecturer:
 *               summary: Lecturer registration
 *               value:
 *                 firstName: Dr. Jane
 *                 lastName: Smith
 *                 email: jane.smith@university.edu
 *                 password: password123
 *                 role: lecturer
 *                 staffId: STAFF001
 *                 departmentCode: CSC
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login and receive access + refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token invalid or expired
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     description: Always returns a generic success message to prevent email enumeration. Token expires in 1 hour.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Reset link sent (if email exists)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword, confirmPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123resettoken
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: newpassword789
 *               confirmPassword:
 *                 type: string
 *                 example: newpassword789
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid/expired token or passwords do not match
 */

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Initiate Google OAuth 2.0 sign-in
 *     tags: [Auth]
 *     description: Redirects the browser to Google's OAuth consent screen. Use this in a browser, not directly in Swagger UI.
 *     responses:
 *       302:
 *         description: Redirect to Google
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout (stateless — client discards tokens)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/auth/update-password:
 *   patch:
 *     summary: Change the authenticated user's password
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: password123
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: newpassword456
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 */
const {
  register,
  login,
  refreshAccessToken,
  getProfile,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const {
  signAccessToken,
  signRefreshToken,
} = require('../helpers/jwtHelper');
const { authentication } = require('../middlewares/authMiddleware');

// Public routes — match brief: /api/register, /api/login, /api/profile
AuthRoute.route('/register').post(register);
AuthRoute.route('/login').post(login);
AuthRoute.route('/auth/refresh').post(refreshAccessToken);
AuthRoute.route('/auth/forgot-password').post(forgotPassword);
AuthRoute.route('/auth/reset-password').post(resetPassword);

// ── Google OAuth (public — must be before authentication middleware) ───────────
AuthRoute.get('/v1/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

AuthRoute.get('/v1/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google`,
  }),
  (req, res) => {
    const user = req.user;
    const payload = {
      userId: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: user._id });

    req.logout((err) => { if (err) console.error('OAuth logout err:', err); });

    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${base}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }
);

// Protected routes
AuthRoute.use(authentication);
AuthRoute.route('/profile').get(getProfile);
AuthRoute.route('/auth/logout').post(logout);
AuthRoute.route('/auth/update-password').patch(updatePassword);

module.exports = AuthRoute;
