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
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(cors());
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

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
