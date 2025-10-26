import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';

// Mengaugmentasi tipe Request dari Express untuk menyisipkan 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization header missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Token missing', 401);
    }

    const payload = verifyToken(token);
    
    // Verifikasi apakah user dari token masih ada di database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Lampirkan payload user ke request
    req.user = { id: user.id };
    next();
  } catch (error) {
    // Teruskan error ke errorMiddleware
    next(error);
  }
};
