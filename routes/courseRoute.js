const express = require('express');
const CourseRoute = express.Router();

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Get all courses (Public)
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of all active courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *   post:
 *     summary: Create a new course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseBody'
 *     responses:
 *       201:
 *         description: Course created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error or duplicate course code
 *       403:
 *         description: Access restricted to administrators
 */

/**
 * @swagger
 * /api/v1/courses/lecturer/{lecturerId}:
 *   get:
 *     summary: Get all courses assigned to a lecturer (Public)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: lecturerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d2
 *     responses:
 *       200:
 *         description: Courses assigned to the lecturer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /api/v1/courses/{courseId}:
 *   get:
 *     summary: Get a course by ID (Public)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *   patch:
 *     summary: Update a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *               title:
 *                 type: string
 *                 example: Advanced Data Structures
 *               level:
 *                 type: integer
 *                 enum: [100, 200, 300, 400, 500, 600]
 *                 example: 400
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Course updated
 *       403:
 *         description: Access restricted to administrators
 *       404:
 *         description: Course not found
 *   delete:
 *     summary: Delete a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Course deleted
 *       403:
 *         description: Access restricted to administrators
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/v1/courses/{courseId}/assign-lecturer:
 *   patch:
 *     summary: Assign a lecturer to a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *             required: [lecturerId]
 *             properties:
 *               lecturerId:
 *                 type: string
 *                 example: 6641a2b3c4d5e6f7a8b9c0d2
 *     responses:
 *       200:
 *         description: Lecturer assigned to course
 *       403:
 *         description: Access restricted to administrators
 *       404:
 *         description: Course or lecturer not found
 */
const {
  createCourse,
  getCourses,
  getCourseById,
  assignLecturer,
  getLecturerCourses,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const {
  authentication,
  adminAuthorization,
} = require('../middlewares/authMiddleware');

// Public — anyone can browse courses
CourseRoute.route('/').get(getCourses);
CourseRoute.route('/lecturer/:lecturerId').get(getLecturerCourses);
CourseRoute.route('/:courseId').get(getCourseById);

// Admin-only mutations
CourseRoute.use(authentication);
CourseRoute.route('/').post(adminAuthorization, createCourse);
CourseRoute.route('/:courseId').patch(adminAuthorization, updateCourse);
CourseRoute.route('/:courseId').delete(adminAuthorization, deleteCourse);
CourseRoute.route('/:courseId/assign-lecturer').patch(adminAuthorization, assignLecturer);

module.exports = CourseRoute;
