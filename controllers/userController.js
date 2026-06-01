const { User, Department } = require('../models');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// GET /api/v1/users/profile/:userId  — any authenticated user can view a profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.params.userId)
    .populate('department', 'name code')
    .select('-password -resetPasswordToken -resetPasswordExpiry');

  if (!user) throw new CustomError.NotFoundError('User not found');

  res.status(StatusCodes.OK).json({ success: true, user });
};

// PATCH /api/v1/users/profile/:userId  — user updates own profile (admin can update anyone)
const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user.userId;
  const requesterRole = req.user.role;

  if (requesterRole !== 'admin' && requesterId !== userId) {
    throw new CustomError.ForbiddenError('You can only update your own profile');
  }

  const forbidden = ['password', 'role', 'email', 'resetPasswordToken', 'resetPasswordExpiry'];
  forbidden.forEach((f) => delete req.body[f]);

  const updates = req.body;

  if (updates.departmentCode) {
    const dept = await Department.findOne({ code: updates.departmentCode.toUpperCase() });
    if (!dept) throw new CustomError.NotFoundError('Department not found');
    updates.department = dept._id;
    delete updates.departmentCode;
  }

  if (updates.matricNumber) updates.matricNumber = updates.matricNumber.toUpperCase();
  if (updates.level) updates.level = parseInt(updates.level, 10);
  if (updates.staffId) updates.staffId = updates.staffId.toUpperCase();

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).populate('department', 'name code').select('-password');

  if (!user) throw new CustomError.NotFoundError('User not found');

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
};

// GET /api/v1/users  — Admin: list all users with optional filters
const getAllUsers = async (req, res) => {
  const { role, search, department } = req.query;
  const query = { isActive: true };

  if (role && ['student', 'lecturer', 'admin'].includes(role)) query.role = role;
  if (department) query.department = department;

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { matricNumber: regex },
      { staffId: regex },
    ];
  }

  const users = await User.find(query)
    .populate('department', 'name code')
    .select('-password -resetPasswordToken -resetPasswordExpiry')
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ success: true, count: users.length, users });
};

// GET /api/v1/users/lecturers  — Admin/lecturer: list approved lecturers (optionally by dept)
const getLecturers = async (req, res) => {
  const { departmentId } = req.query;
  const query = { role: 'lecturer', isActive: true };
  if (departmentId) query.department = departmentId;

  const lecturers = await User.find(query)
    .populate('department', 'name code')
    .select('firstName lastName staffId email department')
    .sort({ firstName: 1 });

  res.status(StatusCodes.OK).json({ success: true, count: lecturers.length, lecturers });
};

// GET /api/v1/users/students  — Admin/lecturer: list students (optionally by dept/level)
const getStudents = async (req, res) => {
  const { departmentId, level } = req.query;
  const query = { role: 'student', isActive: true };
  if (departmentId) query.department = departmentId;
  if (level) query.level = parseInt(level, 10);

  const students = await User.find(query)
    .populate('department', 'name code')
    .select('firstName lastName matricNumber email department level')
    .sort({ matricNumber: 1 });

  res.status(StatusCodes.OK).json({ success: true, count: students.length, students });
};

// DELETE /api/v1/users/:userId  — Admin: deactivate a user
const deactivateUser = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new CustomError.NotFoundError('User not found');

  user.isActive = false;
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, message: 'User deactivated successfully' });
};

// PATCH /api/v1/users/:userId/admin-edit  — Admin: edit any user field including role
const adminEditUser = async (req, res) => {
  const { userId } = req.params;
  const allowedFields = ['firstName', 'lastName', 'email', 'role', 'departmentCode', 'matricNumber', 'staffId', 'level'];
  const updates = {};
  allowedFields.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (updates.email) {
    const conflict = await User.findOne({ email: updates.email, _id: { $ne: userId } });
    if (conflict) throw new CustomError.BadRequestError('Email is already in use by another account');
  }

  if (updates.departmentCode) {
    const dept = await Department.findOne({ code: updates.departmentCode.toUpperCase() });
    if (!dept) throw new CustomError.NotFoundError('Department not found');
    updates.department = dept._id;
    delete updates.departmentCode;
  }

  if (updates.matricNumber) updates.matricNumber = updates.matricNumber.toUpperCase();
  if (updates.staffId) updates.staffId = updates.staffId.toUpperCase();
  if (updates.level) updates.level = parseInt(updates.level, 10);

  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true })
    .populate('department', 'name code').select('-password -resetPasswordToken -resetPasswordExpiry');

  if (!user) throw new CustomError.NotFoundError('User not found');

  res.status(StatusCodes.OK).json({ success: true, message: 'User updated successfully', user });
};

// DELETE /api/v1/users/:userId/delete  — Admin: permanently delete a user
const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) throw new CustomError.NotFoundError('User not found');
  res.status(StatusCodes.OK).json({ success: true, message: 'User deleted successfully' });
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getLecturers,
  getStudents,
  deactivateUser,
  adminEditUser,
  deleteUser,
};
