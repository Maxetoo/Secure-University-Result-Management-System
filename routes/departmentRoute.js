const express = require('express');
const DepartmentRoute = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const {
  authentication,
  adminAuthorization,
} = require('../middlewares/authMiddleware');

// Public
DepartmentRoute.route('/').get(getDepartments);
DepartmentRoute.route('/:departmentId').get(getDepartmentById);

// Admin-only mutations
DepartmentRoute.use(authentication);
DepartmentRoute.route('/').post(adminAuthorization, createDepartment);
DepartmentRoute.route('/:departmentId').patch(adminAuthorization, updateDepartment);
DepartmentRoute.route('/:departmentId').delete(adminAuthorization, deleteDepartment);

module.exports = DepartmentRoute;
