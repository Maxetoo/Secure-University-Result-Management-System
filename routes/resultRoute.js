const express = require('express');
const ResultRoute = express.Router();

/**
 * @swagger
 * /api/v1/results:
 *   post:
 *     summary: Upload a new result (Lecturer or Admin)
 *     tags: [Results]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Submit a student result. Optionally attach a supporting document (PDF or image).
 *       Grade is auto-computed from score: >=70 A, >=60 B, >=50 C, >=45 D, >=40 E, <40 F.
 *       Use **multipart/form-data** when attaching a document, otherwise **application/json**.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, courseId, semester, academicYear, score]
 *             properties:
 *               studentId:
 *                 type: string
 *                 example: 6641a2b3c4d5e6f7a8b9c0d1
 *               courseId:
 *                 type: string
 *                 example: 6641a2b3c4d5e6f7a8b9c0d2
 *               semester:
 *                 type: string
 *                 enum: [First, Second]
 *                 example: First
 *               academicYear:
 *                 type: string
 *                 example: "2023/2024"
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 75
 *               remarks:
 *                 type: string
 *                 example: Good performance
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [studentId, courseId, semester, academicYear, score]
 *             properties:
 *               studentId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               semester:
 *                 type: string
 *                 enum: [First, Second]
 *               academicYear:
 *                 type: string
 *               score:
 *                 type: number
 *               remarks:
 *                 type: string
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: PDF or image file (max 10 MB)
 *     responses:
 *       201:
 *         description: Result uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   $ref: '#/components/schemas/Result'
 *       400:
 *         description: Validation error or duplicate result
 *       403:
 *         description: Access restricted to lecturers and administrators
 *   get:
 *     summary: Get all results (Admin sees all; Lecturer sees their courses only)
 *     tags: [Results]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [First, Second]
 *         description: Filter by semester
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Filter by academic year e.g. 2023/2024
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by student name, matric number, or course code
 *     responses:
 *       200:
 *         description: List of results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Result'
 *       403:
 *         description: Access restricted to lecturers and administrators
 */

/**
 * @swagger
 * /api/v1/results/my:
 *   get:
 *     summary: Get the logged-in student's own results (Student only)
 *     tags: [Results]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [First, Second]
 *         description: Optional filter by semester
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Optional filter e.g. 2023/2024
 *     responses:
 *       200:
 *         description: Student's results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Result'
 *       403:
 *         description: Access restricted to students
 */

/**
 * @swagger
 * /api/v1/results/student/{studentId}:
 *   get:
 *     summary: Get all results for a specific student (Lecturer or Admin)
 *     tags: [Results]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Results for the specified student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 student:
 *                   $ref: '#/components/schemas/UserProfile'
 *                 count:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Result'
 *       403:
 *         description: Access restricted to lecturers and administrators
 *       404:
 *         description: Student not found
 */

/**
 * @swagger
 * /api/v1/results/{id}:
 *   patch:
 *     summary: Edit a result (Lecturer or Admin)
 *     tags: [Results]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Update score, remarks, semester, or academicYear. Grade is auto-recomputed.
 *       Lecturers can only edit results they uploaded or for courses assigned to them.
 *       Use **multipart/form-data** to also replace the attached document.
 *     parameters:
 *       - in: path
 *         name: id
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
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 82
 *               remarks:
 *                 type: string
 *                 example: Revised after re-marking
 *               semester:
 *                 type: string
 *                 enum: [First, Second]
 *               academicYear:
 *                 type: string
 *                 example: "2023/2024"
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *               remarks:
 *                 type: string
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: New document — replaces the existing Cloudinary file
 *     responses:
 *       200:
 *         description: Result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   $ref: '#/components/schemas/Result'
 *       403:
 *         description: Not your result to edit
 *       404:
 *         description: Result not found
 *   delete:
 *     summary: Delete a result (Admin only)
 *     tags: [Results]
 *     security:
 *       - BearerAuth: []
 *     description: Permanently deletes the result and its Cloudinary document (if any).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6641a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Result deleted successfully
 *       403:
 *         description: Access restricted to administrators
 *       404:
 *         description: Result not found
 */
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
