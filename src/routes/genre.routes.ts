import { Router } from 'express';
import {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
} from '../controllers/genre.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Lindungi semua rute genre dengan authMiddleware
router.use(authMiddleware);

router.post('/', createGenre);
router.get('/', getAllGenres);
router.get('/:id', getGenreById);
router.patch('/:id', updateGenre);
router.delete('/:id', deleteGenre);

export default router;
