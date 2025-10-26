import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import genreRoutes from './genre.routes';
import bookRoutes from './book.routes';
import transactionRoutes from './transaction.routes';

const router = Router();

// Gabungkan semua rute
router.use('/health-check', healthRoutes);
router.use('/auth', authRoutes);
router.use('/genre', genreRoutes);
router.use('/books', bookRoutes);
router.use('/transactions', transactionRoutes);

export default router;
