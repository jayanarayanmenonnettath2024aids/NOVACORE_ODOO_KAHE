import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config();

console.log('Environment loaded:', { DATABASE_URL: process.env.DATABASE_URL?.substring(0, 20) + '...', PORT: process.env.PORT });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5005;

console.log('Prisma initialized, PORT:', PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

try {
  console.log('Loading routes...');
  const authRoutes = require('./routes/authRoutes').default;
  const userRoutes = require('./routes/userRoutes').default;
  const tripRoutes = require('./routes/tripRoutes').default;
  const dashboardRoutes = require('./routes/dashboardRoutes').default;
  const checklistRoutes = require('./routes/checklistRoutes').default;
  const notesRoutes = require('./routes/notesRoutes').default;
  const searchRoutes = require('./routes/searchRoutes').default;
  const publicTripRoutes = require('./routes/publicTripRoutes').default;
  const adminRoutes = require('./routes/adminRoutes').default;
  const aiRoutes = require('./routes/aiRoutes').default;
  console.log('Routes loaded successfully');

  // Basic Health Check Route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Traveloop API is running' });
  });

  // Serve static frontend files
  app.use(express.static(path.join(__dirname, '../public')));

  // Root route so browser shows the minimal UI instead of an error
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/checklist', checklistRoutes);
  app.use('/api/notes', notesRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/public/trips', publicTripRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  // Process error handlers
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  console.log(`Attempting to listen on 0.0.0.0:7000...`);
  const server = app.listen(7000, '0.0.0.0', () => {
    console.log(`✓ Server is successfully running on http://localhost:7000`);
  });

  server.on('error', (error: any) => {
    console.error('CRITICAL SERVER ERROR:', error);
    if (error.code === 'EADDRINUSE') {
      console.error('Port 7000 is busy. Please run "taskkill /F /IM node.exe"');
    }
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
