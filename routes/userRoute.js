const express = require('express');
const UserRoute = express.Router();
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getLecturers,
  getStudents,
  deactivateUser,
  adminEditUser,
  deleteUser,
} = require('../controllers/userController');
const { createAdmin } = require('../controllers/authController');
const {
  authentication,
  adminAuthorization,
  lecturerOrAdminAuthorization,
} = require('../middlewares/authMiddleware');

UserRoute.use(authentication);

UserRoute.route('/profile/:userId').get(getProfile).patch(updateProfile);

// Admin: full user list, deactivate, create admin
UserRoute.route('/').get(adminAuthorization, getAllUsers);
UserRoute.route('/create-admin').post(adminAuthorization, createAdmin);
UserRoute.route('/:userId/deactivate').patch(adminAuthorization, deactivateUser);
UserRoute.route('/:userId/admin-edit').patch(adminAuthorization, adminEditUser);
UserRoute.route('/:userId/delete').delete(adminAuthorization, deleteUser);

// Lecturers + admin: view lecturers and students for result management
UserRoute.route('/lecturers').get(lecturerOrAdminAuthorization, getLecturers);
UserRoute.route('/students').get(lecturerOrAdminAuthorization, getStudents);

module.exports = UserRoute;
