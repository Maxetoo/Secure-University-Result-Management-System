const { Course, Department, User } = require('../models');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// Create course
const createCourse = async (req, res) => {
  const { courseCode, title, departmentCode, level, lecturerId } = req.body;
  
  if (!courseCode || !title || !departmentCode || !level) {
    throw new CustomError.BadRequestError('Course code, title, department, and level are required');
  }
  
  // Find department
  const department = await Department.findOne({ code: departmentCode.toUpperCase() });
  if (!department) {
    throw new CustomError.NotFoundError('Department not found');
  }
  
  // Verify lecturer if provided
  if (lecturerId) {
    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== 'lecturer') {
      throw new CustomError.BadRequestError('Invalid lecturer');
    }
  }
  
  const course = await Course.create({
    courseCode: courseCode.toUpperCase(),
    title,
    department: department._id,
    level,
    lecturer: lecturerId
  });
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Course created successfully',
    course: {
      id: course._id,
      courseCode: course.courseCode,
      title: course.title,
      level: course.level
    }
  });
};

// Get courses by department and level
const getCourses = async (req, res) => {
  const { departmentCode, level } = req.query;
  
  let query = { isActive: true };
  
  if (departmentCode) {
    const department = await Department.findOne({ code: departmentCode.toUpperCase() });
    if (department) {
      query.department = department._id;
    }
  }
  
  if (level) {
    query.level = parseInt(level);
  }
  
  const courses = await Course.find(query)
    .populate('department', 'name code')
    .populate('lecturer', 'firstName lastName staffId')
    .sort({ courseCode: 1 });
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: courses.length,
    courses
  });
};

// Get course by ID
const getCourseById = async (req, res) => {
  const { courseId } = req.params;
  
  const course = await Course.findById(courseId)
    .populate('department', 'name code')
    .populate('lecturer', 'firstName lastName staffId');
  
  if (!course) {
    throw new CustomError.NotFoundError('Course not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    course
  });
};

// Assign lecturer to course
const assignLecturer = async (req, res) => {
  const { courseId } = req.params;
  const { lecturerId } = req.body;
  
  const course = await Course.findById(courseId);
  if (!course) {
    throw new CustomError.NotFoundError('Course not found');
  }
  
  const lecturer = await User.findById(lecturerId);
  if (!lecturer || lecturer.role !== 'lecturer') {
    throw new CustomError.BadRequestError('Invalid lecturer');
  }

  course.lecturer = lecturerId;
  await course.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Lecturer assigned successfully',
    course: {
      id: course._id,
      courseCode: course.courseCode,
      lecturer: {
        id: lecturer._id,
        name: `${lecturer.firstName} ${lecturer.lastName}`
      }
    }
  });
};

// Get courses for a lecturer
const getLecturerCourses = async (req, res) => {
  const { lecturerId } = req.params;
  
  const courses = await Course.find({
    lecturer: lecturerId,
    isActive: true
  })
  .populate('department', 'name code')
  .sort({ courseCode: 1 });
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: courses.length,
    courses
  });
};

// Update course
const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const updates = req.body;
  
  // Don't allow changing course code
  delete updates.courseCode;
  
  const course = await Course.findByIdAndUpdate(
    courseId,
    updates,
    { new: true, runValidators: true }
  )
  .populate('department', 'name code')
  .populate('lecturer', 'firstName lastName');
  
  if (!course) {
    throw new CustomError.NotFoundError('Course not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course updated successfully',
    course
  });
};

// Delete course
const deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw new CustomError.NotFoundError('Course not found');
  }
  
  course.isActive = false;
  await course.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course deleted successfully'
  });
};

module.exports = {
  assignLecturer,
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  getLecturerCourses,
  updateCourse,
};