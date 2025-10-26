import { Response } from 'express';

/**
 * Mengirim respons sukses terstandardisasi
 * Sesuai format: {"success": true, "message": "...", "data": ...}
 */
export const sendSuccess = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 200
) => {
  const response: { success: boolean; message: string; data?: any; meta?: any } =
    {
      success: true,
      message,
    };

  // Pisahkan 'data' dan 'meta' jika 'data' mengandung 'meta' (untuk pagination)
  if (data && data.meta) {
    response.data = data.data;
    response.meta = data.meta;
  } else if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Mengirim respons error terstandardisasi
 * Sesuai format: {"success": false, "message": "..."}
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500
) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};
