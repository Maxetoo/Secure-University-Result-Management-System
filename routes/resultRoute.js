const express = require('express');
const ResultRoute = express.Router();
const {
  uploadResult,
  editResult,
  getMyResults,
  getAllResults,
  getStudentResults,
  deleteResult,
} = require('../controllers/resultController');
const {
  authentication,
  studentAuthorization,
  lecturerAuthorization,
  adminAuthorization,
  lecturerOrAdminAuthorization,
} = require('../middlewares/authMiddleware');

ResultRoute.use(authentication);

// Student: view own results
ResultRoute.route('/my').get(studentAuthorization, getMyResults);

// Lecturer: upload and edit
ResultRoute.route('/').post(lecturerOrAdminAuthorization, uploadResult);
ResultRoute.route('/:id').patch(lecturerOrAdminAuthorization, editResult);

// Admin: all results; Lecturer: their course results
ResultRoute.route('/').get(lecturerOrAdminAuthorization, getAllResults);
ResultRoute.route('/student/:studentId').get(lecturerOrAdminAuthorization, getStudentResults);
ResultRoute.route('/:id').delete(adminAuthorization, deleteResult);

module.exports = ResultRoute;
