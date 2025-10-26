import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.utils';

export const getHealth = (req: Request, res: Response) => {
  // Kirim respons sukses sesuai format
  sendSuccess(
    res,
    'Health check successful',
    { date: new Date().toISOString() },
    200
  );
};
