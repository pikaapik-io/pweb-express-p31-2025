import { Request, Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import { sendSuccess } from '../utils/response.utils';

// Async handler wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    // Ambil userId dari token, bukan dari body
    const userId = req.user!.id;
    const { items } = req.body;
    const result = await transactionService.createTransaction(userId, items);
    sendSuccess(res, 'Transaction created successfully', result, 201);
  }
);

export const getAllTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await transactionService.getAllTransactions(req.query);
    // Note: Postman response tidak menunjukkan 'meta', jadi kita kirim 'data' saja
    sendSuccess(res, 'Get all transaction successfully', result.data);
  }
);

export const getTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await transactionService.getTransactionById(req.params.id);
    sendSuccess(res, 'Get transaction detail successfully', result);
  }
);

export const getTransactionStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await transactionService.getTransactionStatistics();
    sendSuccess(res, 'Get transactions statistics successfully', result);
  }
);
