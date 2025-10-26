import { Router } from 'express';
import {
  createBook,
  getAllBooks,
  getBooksByGenre,
  getBookById,
  updateBook,
  deleteBook,
} from '../controllers/book.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Lindungi semua rute buku dengan authMiddleware
router.use(authMiddleware);

router.post('/', createBook);
router.get('/', getAllBooks);
// Rute ini harus sebelum /:id agar tidak tertukar
router.get('/genre/:id', getBooksByGenre);
router.get('/:id', getBookById);
router.patch('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;
