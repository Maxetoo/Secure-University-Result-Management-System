const express = require('express');
const AuthRoute = express.Router();
const passport = require('../configs/passport');
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
