const express = require('express');
const CourseRoute = express.Router();
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
