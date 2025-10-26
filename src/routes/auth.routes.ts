import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// Lindungi endpoint /me dengan authMiddleware
router.get('/me', authMiddleware, getMe);

export default router;
