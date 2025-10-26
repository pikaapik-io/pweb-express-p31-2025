import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// BENAR: Import './routes' (dia akan otomatis cari 'routes/index.ts')
import rootRouter from './routes/index';
import { errorMiddleware } from './middleware/errorMiddleware';
import { sendError } from './utils/response.utils';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to IT Literature Shop API',
  });
});

// API routes
app.use(rootRouter);

// 404 Not Found Middleware
app.use((req: Request, res: Response) => {
  sendError(res, 'Route not found', 404);
});

// Global Error Middleware
app.use(errorMiddleware);

export default app;

