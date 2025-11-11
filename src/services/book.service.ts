import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const createBook = async (body: any) => {
  const { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id, isbn, condition } = body;

  // Cek duplikasi judul
  const existingBook = await prisma.book.findFirst({
      where: { title, deletedAt: null }
  });
  if (existingBook) {
      throw new AppError('Book with this title already exists', 409);
  }

  const book = await prisma.book.create({
    // Cast to any because Prisma client types may be out-of-date until `prisma generate` is run
    data: {
      title,
      writer,
      publisher,
      publicationYear: parseInt(publication_year),
      description,
      isbn,
      condition,
      price: parseFloat(price),
      stockQuantity: parseInt(stock_quantity),
      genreId: genre_id,
    } as any,
    select: {
        id: true,
        title: true,
        createdAt: true
    } as any,
  } as any);
  return book;
};

const getBooksPaginated = async (query: any, extraWhere: object = {}) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const search = query.search as string | undefined;
  const orderByTitle = (query.orderByTitle as 'asc' | 'desc') || undefined;
  const orderByPublishDate = (query.orderByPublishDate as 'asc' | 'desc') || undefined;

  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null, // Filter soft delete
    ...extraWhere,
  };

  if (search) {
    where.title = {
      contains: search,
      mode: 'insensitive',
    };
  }
  
  const orderBy = [];
  if (orderByTitle) orderBy.push({ title: orderByTitle });
  if (orderByPublishDate) orderBy.push({ publicationYear: orderByPublishDate });

  const books = await prisma.book.findMany({
    where,
    skip,
    take: limit,
    orderBy: orderBy.length > 0 ? orderBy : undefined,
    select: {
      id: true,
      title: true,
      writer: true,
      publisher: true,
      description: true,
      isbn: true,
      condition: true,
      publicationYear: true,
      price: true,
      stockQuantity: true,
      genre: {
        select: {
          name: true,
        },
      },
    } as any,
  } as any) as any;

  // Cast to any to avoid type errors if Prisma client types are not yet regenerated
  const booksAny = books as any;

  // Map data agar 'genre' menjadi string (cast to any because of prisma client typing)
  const formattedBooks = (booksAny as any[]).map((b: any) => ({
    ...b,
    genre: b.genre?.name
  }));

  const totalBooks = await prisma.book.count({ where });
  const totalPages = Math.ceil(totalBooks / limit);

  return {
    data: formattedBooks,
    meta: {
      page,
      limit,
      prev_page: page > 1 ? page - 1 : null,
      next_page: page < totalPages ? page + 1 : null,
      total_pages: totalPages,
      total_items: totalBooks
    },
  };
}

export const getAllBooks = async (query: any) => {
    return getBooksPaginated(query);
}

export const getBooksByGenre = async (genreId: string, query: any) => {
    return getBooksPaginated(query, { genreId });
}

export const getBookById = async (id: string) => {
  const book = await prisma.book.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      writer: true,
      publisher: true,
      description: true,
      isbn: true,
      condition: true,
      publicationYear: true,
      price: true,
      stockQuantity: true,
      genre: {
        select: {
          name: true,
        },
      },
    } as any,
  } as any) as any;
  if (!book) {
    throw new AppError('Book not found', 404);
  }
  // Format data
  // book typed as any above, so we can safely map genre
  return {
    ...book,
    genre: (book as any).genre?.name
  };
};

export const updateBook = async (id: string, body: any) => {
  // Sesuai soal, hanya boleh update field ini
  const { description, price, stock_quantity, isbn, condition } = body;
  
  const dataToUpdate: any = {};
  if (description !== undefined) dataToUpdate.description = description;
  if (price !== undefined) dataToUpdate.price = parseFloat(price);
  if (stock_quantity !== undefined) dataToUpdate.stockQuantity = parseInt(stock_quantity);
  if (isbn !== undefined) dataToUpdate.isbn = isbn;
  if (condition !== undefined) dataToUpdate.condition = condition;

  if (Object.keys(dataToUpdate).length === 0) {
      throw new AppError("No valid fields to update", 400);
  }

  const book = await prisma.book.update({
    where: { id },
    data: dataToUpdate as any,
    select: {
        id: true,
        title: true,
        updatedAt: true
    }
  });
  return book;
};

export const deleteBook = async (id: string) => {
  // Soft delete
  await prisma.book.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return;
};
