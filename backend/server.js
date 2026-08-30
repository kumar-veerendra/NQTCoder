import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import mockTestRoutes from './routes/mockTestRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import companyGuideRoutes from './routes/companyGuideRoutes.js';
import adminCompanyGuideRoutes from './routes/adminCompanyGuideRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Connect to database
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// CLIENT_URL is the primary (new) domain; CORS also accepts the legacy Vercel
// domain and localhost so existing users and local dev are never broken.
const allowedOrigins = [
  process.env.CLIENT_URL,           // primary: https://www.nqtcoder.dev
  'https://www.nqtcoder.dev',       // always allow the production domain
  'https://nqtcoder.vercel.app',    // legacy domain — keep alive during transition
  'http://localhost:5173',          // Vite local dev
  'http://localhost:3000',          // CRA / alternate dev port
].filter(Boolean); // strip undefined in case CLIENT_URL is not set

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server calls (Postman, curl, render health-checks) which send no Origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin '${origin}' is not allowed.`));
    }
  },
  credentials: true,   // needed if you ever attach cookies / auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pre-flight for all routes
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('NQTCoder API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/mocktests', mockTestRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/company-guides', companyGuideRoutes);
app.use('/api/admin', adminCompanyGuideRoutes);
app.use('/api/games', gameRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
