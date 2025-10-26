import { Request, Response, NextFunction } from 'express';
import * as bookService from '../services/book.service';
import { sendSuccess } from '../utils/response.utils';

// Async handler wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await bookService.createBook(req.body);
  sendSuccess(res, 'Book added successfully', book, 201);
});

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookService.getAllBooks(req.query);
  sendSuccess(res, 'Get all book successfully', result);
});

export const getBooksByGenre = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookService.getBooksByGenre(req.params.id, req.query);
    sendSuccess(res, 'Get all book by genre successfully', result);
  }
);

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const book = await bookService.getBookById(req.params.id);
  sendSuccess(res, 'Get book detail successfully', book);
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await bookService.updateBook(req.params.id, req.body);
  sendSuccess(res, 'Book updated successfully', book);
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  await bookService.deleteBook(req.params.id);
  sendSuccess(res, 'Book removed successfully');
});
