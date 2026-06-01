const { StatusCodes } = require('http-status-codes');
const { Result, User, Course } = require('../models');
const CustomError = require('../errors');
const cloudinary = require('../configs/cloudinaryConfig');
const fs = require('fs').promises;

// Helper: upload file to Cloudinary and return url + public_id
const uploadToCloudinary = async (filePath, folder = 'result-documents') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });
  return { url: result.secure_url, publicId: result.public_id };
};

// POST /api/results  — Lecturer uploads a result (optionally attaches a document)
const uploadResult = async (req, res) => {
  const { studentId, courseId, semester, academicYear, score, remarks } = req.body;

  if (!studentId || !courseId || !semester || !academicYear || score === undefined) {
    throw new CustomError.BadRequestError(
      'studentId, courseId, semester, academicYear, and score are required'
    );
  }

  // Verify the target student exists
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    throw new CustomError.NotFoundError('Student not found');
  }

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    throw new CustomError.NotFoundError('Course not found');
  }

  // Check for duplicate
  const duplicate = await Result.findOne({
    student: studentId,
    course: courseId,
    semester,
    academicYear,
  });
  if (duplicate) {
    throw new CustomError.BadRequestError(
      'A result for this student, course, semester, and academic year already exists. Use edit to update it.'
    );
  }

  const resultData = {
    student: studentId,
    course: courseId,
    semester,
    academicYear,
    score: parseFloat(score),
    remarks,
    uploadedBy: req.user.userId,
  };

  // Handle optional document upload
  if (req.files && req.files.document) {
    const file = req.files.document;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new CustomError.BadRequestError('Document must be a PDF or image (JPEG, PNG, WEBP)');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new CustomError.BadRequestError('Document must be under 10 MB');
    }
    try {
      const { url, publicId } = await uploadToCloudinary(file.tempFilePath);
      resultData.documentUrl = url;
      resultData.documentPublicId = publicId;
    } finally {
      await fs.unlink(file.tempFilePath).catch(() => {});
    }
  }

  const result = await Result.create(resultData);

  await result.populate([
    { path: 'student', select: 'firstName lastName matricNumber email' },
    { path: 'course', select: 'courseCode title' },
  ]);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Result uploaded successfully',
    result,
  });
};

// PATCH /api/results/:id  — Lecturer edits a result they uploaded
const editResult = async (req, res) => {
  const { id } = req.params;
  const { score, remarks, semester, academicYear } = req.body;

  const result = await Result.findById(id).populate('course', 'lecturer');
  if (!result) throw new CustomError.NotFoundError('Result not found');

  if (req.user.role === 'lecturer') {
    const isUploader = result.uploadedBy.toString() === req.user.userId;
    const isCourseLecturer = result.course?.lecturer?.toString() === req.user.userId;
    if (!isUploader && !isCourseLecturer) {
      throw new CustomError.ForbiddenError('You can only edit results you uploaded or for courses assigned to you');
    }
  }

  if (score !== undefined) result.score = parseFloat(score);
  if (remarks !== undefined) result.remarks = remarks;
  if (semester !== undefined) result.semester = semester;
  if (academicYear !== undefined) result.academicYear = academicYear;
  result.lastEditedBy = req.user.userId;

  // Handle optional new document upload
  if (req.files && req.files.document) {
    const file = req.files.document;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new CustomError.BadRequestError('Document must be a PDF or image');
    }
    try {
      // Delete old document from Cloudinary if present
      if (result.documentPublicId) {
        await cloudinary.uploader.destroy(result.documentPublicId, { resource_type: 'raw' }).catch(() => {});
      }
      const { url, publicId } = await uploadToCloudinary(file.tempFilePath);
      result.documentUrl = url;
      result.documentPublicId = publicId;
    } finally {
      await fs.unlink(file.tempFilePath).catch(() => {});
    }
  }

  await result.save();

  await result.populate([
    { path: 'student', select: 'firstName lastName matricNumber email' },
    { path: 'course', select: 'courseCode title' },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Result updated successfully',
    result,
  });
};

// GET /api/results/my  — Student views their own results
const getMyResults = async (req, res) => {
  const { semester, academicYear } = req.query;
  const query = { student: req.user.userId };

  if (semester) query.semester = semester;
  if (academicYear) query.academicYear = academicYear;

  const results = await Result.find(query)
    .populate('course', 'courseCode title level')
    .populate('uploadedBy', 'firstName lastName')
    .sort({ academicYear: -1, semester: 1, createdAt: -1 });

  res.status(StatusCodes.OK).json({
    success: true,
    count: results.length,
    results,
  });
};

// GET /api/results  — Admin: all results; Lecturer: only results for courses they teach
const getAllResults = async (req, res) => {
  const { studentId, courseId, semester, academicYear, search } = req.query;
  const query = {};

  if (req.user.role === 'lecturer') {
    const lecturerCourses = await Course.find({ lecturer: req.user.userId, isActive: true }).select('_id');
    query.course = { $in: lecturerCourses.map((c) => c._id) };
  }

  if (studentId) query.student = studentId;
  if (courseId) query.course = courseId;
  if (semester) query.semester = semester;
  if (academicYear) query.academicYear = academicYear;

  const results = await Result.find(query)
    .populate('student', 'firstName lastName matricNumber email')
    .populate('course', 'courseCode title level department lecturer')
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

  let filtered = results;
  if (search) {
    const regex = new RegExp(search, 'i');
    filtered = results.filter((r) =>
      regex.test(r.student?.firstName) ||
      regex.test(r.student?.lastName) ||
      regex.test(r.student?.matricNumber) ||
      regex.test(r.course?.courseCode) ||
      regex.test(r.course?.title)
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    count: filtered.length,
    results: filtered,
  });
};

// GET /api/results/student/:studentId  — Admin or lecturer views a specific student's results
const getStudentResults = async (req, res) => {
  const { studentId } = req.params;

  const student = await User.findById(studentId).select('firstName lastName matricNumber email');
  if (!student) throw new CustomError.NotFoundError('Student not found');

  const results = await Result.find({ student: studentId })
    .populate('course', 'courseCode title level')
    .populate('uploadedBy', 'firstName lastName')
    .sort({ academicYear: -1, semester: 1 });

  res.status(StatusCodes.OK).json({
    success: true,
    student,
    count: results.length,
    results,
  });
};

// DELETE /api/results/:id  — Admin deletes a result
const deleteResult = async (req, res) => {
  const { id } = req.params;

  const result = await Result.findById(id);
  if (!result) throw new CustomError.NotFoundError('Result not found');

  if (result.documentPublicId) {
    await cloudinary.uploader.destroy(result.documentPublicId, { resource_type: 'raw' }).catch(() => {});
  }

  await result.deleteOne();

  res.status(StatusCodes.OK).json({ success: true, message: 'Result deleted successfully' });
};

module.exports = {
  uploadResult,
  editResult,
  getMyResults,
  getAllResults,
  getStudentResults,
  deleteResult,
};
