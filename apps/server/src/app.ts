import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { registerRoutes } from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Routes
registerRoutes(app);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
