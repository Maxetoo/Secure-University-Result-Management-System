const { Department } = require('../models');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// Create department
const createDepartment = async (req, res) => {
  const { name, code } = req.body;
  
  if (!name || !code) {
    throw new CustomError.BadRequestError('Department name and code are required');
  }
  
  const department = await Department.create({
    name,
    code: code.toUpperCase()
  });
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Department created successfully',
    department: {
      id: department._id,
      name: department.name,
      code: department.code
    }
  });
};

// Get all departments
const getDepartments = async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .sort({ name: 1 });
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: departments.length,
    departments
  });
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  const { departmentId } = req.params;
  
  const department = await Department.findById(departmentId);
  
  if (!department) {
    throw new CustomError.NotFoundError('Department not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    department
  });
};

// Update department
const updateDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const updates = req.body;
  
  // Don't allow changing code
  delete updates.code;
  
  const department = await Department.findByIdAndUpdate(
    departmentId,
    updates,
    { new: true, runValidators: true }
  );
  
  if (!department) {
    throw new CustomError.NotFoundError('Department not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Department updated successfully',
    department
  });
};

// Delete department
const deleteDepartment = async (req, res) => {
  const { departmentId } = req.params;
  
  const department = await Department.findById(departmentId);
  
  if (!department) {
    throw new CustomError.NotFoundError('Department not found');
  }
  
  department.isActive = false;
  await department.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Department deleted successfully'
  });
};

module.exports = {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
};