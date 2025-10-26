import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle error unik dari Prisma (misal: email atau judul duplikat)
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    const target = (err.meta?.target as string[])?.join(', ');
    return sendError(res, `Duplicate field: ${target} already exists.`, 409); // 409 Conflict
  }

  // Handle error not found dari Prisma
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2025'
  ) {
    return sendError(res, 'Resource not found.', 404);
  }

  // Error umum
  return sendError(res, 'Internal Server Error', 500);
};
