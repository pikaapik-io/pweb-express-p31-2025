import { Router } from 'express';
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionStatistics,
} from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Lindungi semua rute transaksi dengan authMiddleware
router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/', getAllTransactions);
// Rute /statistics harus sebelum /:id
router.get('/statistics', getTransactionStatistics);
router.get('/:id', getTransactionById);

export default router;
