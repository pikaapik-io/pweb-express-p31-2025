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

// Make list/detail endpoints public so frontend can fetch books without a token.
// Protect only routes that modify data (create/update/delete).
router.get('/', getAllBooks);
// Rute ini harus sebelum /:id agar tidak tertukar
router.get('/genre/:id', getBooksByGenre);
router.get('/:id', getBookById);

// Protected routes
router.post('/', authMiddleware, createBook);
router.patch('/:id', authMiddleware, updateBook);
router.delete('/:id', authMiddleware, deleteBook);

export default router;
