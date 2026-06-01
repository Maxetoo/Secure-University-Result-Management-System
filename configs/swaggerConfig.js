const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'University Result Management System API',
      version: '1.0.0',
      description:
        'REST API for managing university student results. Supports student, lecturer, and admin roles with JWT authentication and Google OAuth 2.0.',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your access token here. Get it from POST /api/login.',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────────
        RegisterStudentBody: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'role', 'matricNumber', 'level'],
          properties: {
            firstName:    { type: 'string', example: 'John' },
            lastName:     { type: 'string', example: 'Doe' },
            email:        { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password:     { type: 'string', minLength: 8, example: 'password123' },
            role:         { type: 'string', enum: ['student'], example: 'student' },
            matricNumber: { type: 'string', example: 'VUG/CSC/22/7410' },
            level:        { type: 'integer', enum: [100, 200, 300, 400, 500, 600], example: 200 },
            departmentCode: { type: 'string', example: 'CSC', description: 'Optional' },
          },
        },
        RegisterLecturerBody: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'role', 'staffId'],
          properties: {
            firstName:  { type: 'string', example: 'Dr. Jane' },
            lastName:   { type: 'string', example: 'Smith' },
            email:      { type: 'string', format: 'email', example: 'jane.smith@university.edu' },
            password:   { type: 'string', minLength: 8, example: 'password123' },
            role:       { type: 'string', enum: ['lecturer'], example: 'lecturer' },
            staffId:    { type: 'string', example: 'STAFF001' },
            departmentCode: { type: 'string', example: 'CSC', description: 'Optional' },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success:      { type: 'boolean', example: true },
            message:      { type: 'string', example: 'Login successful' },
            accessToken:  { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id:        { type: 'string', example: '6641a2b3c4d5e6f7a8b9c0d1' },
                firstName: { type: 'string', example: 'John' },
                lastName:  { type: 'string', example: 'Doe' },
                email:     { type: 'string', example: 'john.doe@example.com' },
                role:      { type: 'string', example: 'student' },
              },
            },
          },
        },
        // ── User ─────────────────────────────────────────────────────────────
        UserProfile: {
          type: 'object',
          properties: {
            id:           { type: 'string', example: '6641a2b3c4d5e6f7a8b9c0d1' },
            firstName:    { type: 'string', example: 'John' },
            lastName:     { type: 'string', example: 'Doe' },
            email:        { type: 'string', example: 'john.doe@example.com' },
            role:         { type: 'string', enum: ['student', 'lecturer', 'admin'] },
            isActive:     { type: 'boolean', example: true },
            department:   { type: 'object', properties: { name: { type: 'string' }, code: { type: 'string' } } },
            matricNumber: { type: 'string', example: 'VUG/CSC/22/7410', description: 'Students only' },
            level:        { type: 'integer', example: 200, description: 'Students only' },
            staffId:      { type: 'string', example: 'STAFF001', description: 'Lecturers only' },
            createdAt:    { type: 'string', format: 'date-time' },
          },
        },
        // ── Department ───────────────────────────────────────────────────────
        Department: {
          type: 'object',
          properties: {
            _id:       { type: 'string', example: '6641a2b3c4d5e6f7a8b9c0d1' },
            name:      { type: 'string', example: 'Computer Science' },
            code:      { type: 'string', example: 'CSC' },
            isActive:  { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DepartmentBody: {
          type: 'object',
          required: ['name', 'code'],
          properties: {
            name: { type: 'string', example: 'Computer Science' },
            code: { type: 'string', example: 'CSC' },
          },
        },
        // ── Course ───────────────────────────────────────────────────────────
        Course: {
          type: 'object',
          properties: {
            _id:        { type: 'string', example: '6641a2b3c4d5e6f7a8b9c0d1' },
            courseCode: { type: 'string', example: 'CSC304' },
            title:      { type: 'string', example: 'Data Structures and Algorithms' },
            department: { type: 'string', description: 'Department ID', example: '6641a2b3c4d5e6f7a8b9c0d1' },
            level:      { type: 'integer', example: 300 },
            lecturer:   { type: 'string', description: 'Lecturer user ID', example: '6641a2b3c4d5e6f7a8b9c0d2' },
            isActive:   { type: 'boolean', example: true },
          },
        },
        CourseBody: {
          type: 'object',
          required: ['courseCode', 'title', 'department', 'level'],
          properties: {
            courseCode: { type: 'string', example: 'CSC304', description: 'Format: 3 letters + 3 digits e.g. CSC304' },
            title:      { type: 'string', example: 'Data Structures and Algorithms' },
            department: { type: 'string', example: '6641a2b3c4d5e6f7a8b9c0d1', description: 'Department MongoDB ID' },
            level:      { type: 'integer', enum: [100, 200, 300, 400, 500, 600], example: 300 },
          },
        },
        // ── Result ───────────────────────────────────────────────────────────
        Result: {
          type: 'object',
          properties: {
            _id:          { type: 'string', example: '6641a2b3c4d5e6f7a8b9c0d1' },
            student:      { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, matricNumber: { type: 'string' }, email: { type: 'string' } } },
            course:       { type: 'object', properties: { courseCode: { type: 'string' }, title: { type: 'string' } } },
            semester:     { type: 'string', enum: ['First', 'Second'], example: 'First' },
            academicYear: { type: 'string', example: '2023/2024' },
            score:        { type: 'number', example: 75 },
            grade:        { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'F'], example: 'A' },
            remarks:      { type: 'string', example: 'Good performance' },
            documentUrl:  { type: 'string', example: 'https://res.cloudinary.com/...' },
            uploadedBy:   { type: 'string', example: '6641a2b3c4d5e6f7a8b9c0d2' },
            createdAt:    { type: 'string', format: 'date-time' },
            updatedAt:    { type: 'string', format: 'date-time' },
          },
        },
        // ── Errors ───────────────────────────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            msg: { type: 'string', example: 'Something went wrong' },
          },
        },
        SuccessMessage: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth',        description: 'Registration, login, token refresh, password management' },
      { name: 'Users',       description: 'User profile and admin user management' },
      { name: 'Departments', description: 'Department CRUD (admin manages, public reads)' },
      { name: 'Courses',     description: 'Course CRUD (admin manages, public reads)' },
      { name: 'Results',     description: 'Result upload, retrieval, and management' },
    ],
  },
  apis: [
    './routes/authRoute.js',
    './routes/userRoute.js',
    './routes/departmentRoute.js',
    './routes/courseRoute.js',
    './routes/resultRoute.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
