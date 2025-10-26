import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.services';
import { sendSuccess } from '../utils/response.utils';

// Wrapper untuk menangani async error
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await authService.registerUser(req.body);
    // Kirim respons 201 Created
    sendSuccess(res, 'User registered successfully', user, 201);
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await authService.loginUser(req.body);
    sendSuccess(res, 'Login successfully', data);
  }
);

export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // req.user diisi oleh authMiddleware
    const user = await authService.getUserProfile(req.user!.id);
    sendSuccess(res, 'Get me successfully', user);
  }
);
