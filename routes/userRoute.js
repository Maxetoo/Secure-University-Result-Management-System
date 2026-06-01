const express = require('express');
const UserRoute = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Access restricted to administrators
 */

/**
 * @swagger
 * /api/v1/users/profile/{userId}:
 *   get:
 *     summary: Get a user's profile by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: User not found
 *   patch:
 *     summary: Update a user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: UpdatedFirst
 *               lastName:
 *                 type: string
 *                 example: UpdatedLast
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/lecturers:
 *   get:
 *     summary: Get all lecturers (Lecturer or Admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all lecturers
 *       403:
 *         description: Access restricted to lecturers and administrators
 */

/**
 * @swagger
 * /api/v1/users/students:
 *   get:
 *     summary: Get all students (Lecturer or Admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all students
 *       403:
 *         description: Access restricted to lecturers and administrators
 */

/**
 * @swagger
 * /api/v1/users/create-admin:
 *   post:
 *     summary: Create a new admin account (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Super
 *               lastName:
 *                 type: string
 *                 example: Admin
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@university.edu
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: adminpassword123
 *     responses:
 *       201:
 *         description: Admin account created
 *       400:
 *         description: Email already exists or missing fields
 *       403:
 *         description: Access restricted to administrators
 */

/**
 * @swagger
 * /api/v1/users/{userId}/deactivate:
 *   patch:
 *     summary: Deactivate a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: User deactivated (isActive set to false)
 *       403:
 *         description: Access restricted to administrators
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/{userId}/admin-edit:
 *   patch:
 *     summary: Admin edit any user's details (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               level:
 *                 type: integer
 *                 enum: [100, 200, 300, 400, 500, 600]
 *               matricNumber:
 *                 type: string
 *                 example: VUG/CSC/22/0001
 *               staffId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Access restricted to administrators
 */

/**
 * @swagger
 * /api/v1/users/{userId}/delete:
 *   delete:
 *     summary: Permanently delete a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Access restricted to administrators
 *       404:
 *         description: User not found
 */
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
