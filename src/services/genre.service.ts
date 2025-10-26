import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const createGenre = async (name: string) => {
  if (!name) {
    throw new AppError('Genre name is required', 400);
  }
  const genre = await prisma.genre.create({
    data: { name },
  });
  return genre;
};

export const getAllGenres = async (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const search = query.search as string | undefined;
  const orderByName = (query.orderByName as 'asc' | 'desc') || undefined;

  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null, // Hanya ambil yang tidak di soft-delete
  };

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive', // Case-insensitive search
    };
  }

  const genres = await prisma.genre.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      name: orderByName,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const totalGenres = await prisma.genre.count({ where });
  const totalPages = Math.ceil(totalGenres / limit);

  return {
    data: genres,
    meta: {
      page,
      limit,
      prev_page: page > 1 ? page - 1 : null,
      next_page: page < totalPages ? page + 1 : null,
      total_pages: totalPages,
      total_items: totalGenres,
    },
  };
};

export const getGenreById = async (id: string) => {
  const genre = await prisma.genre.findFirst({
    where: { id, deletedAt: null }, // Pastikan tidak di soft-delete
    select: { id: true, name: true },
  });
  if (!genre) {
    throw new AppError('Genre not found', 404);
  }
  return genre;
};

export const updateGenre = async (id: string, name: string) => {
  if (!name) {
    throw new AppError('Genre name is required', 400);
  }
  const genre = await prisma.genre.update({
    where: { id },
    data: { name },
  });
  return genre;
};

export const deleteGenre = async (id: string) => {
  // Lakukan soft delete
  await prisma.genre.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return;
};
