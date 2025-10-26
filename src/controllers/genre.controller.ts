import { Request, Response, NextFunction } from 'express';
import * as genreService from '../services/genre.service';
import { sendSuccess } from '../utils/response.utils';

// Async handler wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const createGenre = asyncHandler(
  async (req: Request, res: Response) => {
    const genre = await genreService.createGenre(req.body.name);
    sendSuccess(res, 'Genre created successfully', genre, 201);
  }
);

export const getAllGenres = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await genreService.getAllGenres(req.query);
    sendSuccess(res, 'Get all genre successfully', result);
  }
);

export const getGenreById = asyncHandler(
  async (req: Request, res: Response) => {
    const genre = await genreService.getGenreById(req.params.id);
    sendSuccess(res, 'Get genre detail successfully', genre);
  }
);

export const updateGenre = asyncHandler(
  async (req: Request, res: Response) => {
    const genre = await genreService.updateGenre(req.params.id, req.body.name);
    sendSuccess(res, 'Genre updated successfully', genre);
  }
);

export const deleteGenre = asyncHandler(
  async (req: Request, res: Response) => {
    await genreService.deleteGenre(req.params.id);
    sendSuccess(res, 'Genre removed successfully');
  }
);
