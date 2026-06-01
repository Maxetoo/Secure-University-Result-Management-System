require('express-async-errors');
require('dotenv').config();

const express = require('express');
const path = require('path');
const fileUploader = require('express-fileupload');
const { rateLimit } = require('express-rate-limit');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./configs/passport');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const app = express();

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [allowedOrigin, 'https://res.cloudinary.com'],
  credentials: true,
}));

app.use(fileUploader({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use(compression());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: false, limit: '15mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 10 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('tiny', {
  skip: (req) => req.path.startsWith('/socket.io'),
}));

// Serve Vite frontend static files
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// API routes
const router = require('./routes/index');
app.use('/api', router);

// Error handling
const ErrorMiddleware = require('./middlewares/errorMiddleware');
const NotFoundMiddleware = require('./middlewares/notFoundRoute');

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.use(NotFoundMiddleware);
app.use(ErrorMiddleware);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

mongoose.connect(mongoUri).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error.message);
  process.exit(1);
});

const port = process.env.PORT || 8080;

mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
});
