const express = require('express');
const Router = express.Router();

const AuthRoute = require('./authRoute');
const UserRoute = require('./userRoute');
const CourseRoute = require('./courseRoute');
const DepartmentRoute = require('./departmentRoute');
const ResultRoute = require('./resultRoute');

// Auth endpoints exactly as per brief: /api/register, /api/login, /api/profile
Router.use('/', AuthRoute);

// Resource endpoints
Router.use('/v1/users', UserRoute);
Router.use('/v1/courses', CourseRoute);
Router.use('/v1/departments', DepartmentRoute);
Router.use('/v1/results', ResultRoute);

module.exports = Router;
