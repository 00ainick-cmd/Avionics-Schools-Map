import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './services/database';

// Import routes
import schoolsRouter from './routes/schools';
import militaryRouter from './routes/military';
import aeaRouter from './routes/aea';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
initDatabase();

// Routes
app.use('/api/schools', schoolsRouter);
app.use('/api/military', militaryRouter);
app.use('/api/aea', aeaRouter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Avionics Schools Map API',
    version: '1.0.0',
    endpoints: {
      schools: '/api/schools',
      military: '/api/military',
      aea: '/api/aea',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  Avionics Schools Map API Server                     ║
║  Port: ${PORT}                                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}                               ║
║  Started: ${new Date().toISOString()}                ║
╚═══════════════════════════════════════════════════════╝
  `);
  console.log('API Endpoints:');
  console.log(`  GET    /api/schools`);
  console.log(`  POST   /api/schools`);
  console.log(`  POST   /api/schools/bulk`);
  console.log(`  GET    /api/military`);
  console.log(`  POST   /api/military`);
  console.log(`  POST   /api/military/bulk`);
  console.log(`  GET    /api/aea`);
  console.log(`  POST   /api/aea`);
  console.log(`  POST   /api/aea/bulk`);
  console.log(`  GET    /api/health`);
});

export default app;
