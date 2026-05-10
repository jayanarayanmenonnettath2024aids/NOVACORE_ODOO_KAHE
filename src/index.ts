import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import tripRoutes from './routes/tripRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import checklistRoutes from './routes/checklistRoutes';
import notesRoutes from './routes/notesRoutes';
import searchRoutes from './routes/searchRoutes';
import publicTripRoutes from './routes/publicTripRoutes';
import adminRoutes from './routes/adminRoutes';

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Traveloop API is running' });
});

import path from 'path';

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

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
