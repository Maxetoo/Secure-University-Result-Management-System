const express = require('express');
const DepartmentRoute = express.Router();

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: Get all departments (Public)
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of all departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 departments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *   post:
 *     summary: Create a new department (Admin only)
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentBody'
 *     responses:
 *       201:
 *         description: Department created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         description: Validation error or duplicate name/code
 *       403:
 *         description: Access restricted to administrators
 */

/**
 * @swagger
 * /api/v1/departments/{departmentId}:
 *   get:
 *     summary: Get a department by ID (Public)
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Department details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 *   patch:
 *     summary: Update a department (Admin only)
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentBody'
 *     responses:
 *       200:
 *         description: Department updated
 *       403:
 *         description: Access restricted to administrators
 *       404:
 *         description: Department not found
 *   delete:
 *     summary: Delete a department (Admin only)
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Department deleted
 *       403:
 *         description: Access restricted to administrators
 *       404:
 *         description: Department not found
 */
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
