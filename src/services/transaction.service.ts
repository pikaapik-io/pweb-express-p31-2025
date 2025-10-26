import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

type TransactionItemInput = {
  book_id: string;
  quantity: number;
};

export const createTransaction = async (
  userId: string,
  items: TransactionItemInput[]
) => {
  if (!items || items.length === 0) {
    throw new AppError('Transaction items cannot be empty', 400);
  }

  // 1. Dapatkan info semua buku dan cek stok
  const bookIds = items.map((item) => item.book_id);
  const books = await prisma.book.findMany({
    where: {
      id: { in: bookIds },
      deletedAt: null, // Pastikan buku tidak di soft-delete
    },
  });

  let totalQuantity = 0;
  let totalPrice = 0;
  const orderItemsData: { bookId: string; quantity: number; priceAtBuy: number }[] = [];

  for (const item of items) {
    const book = books.find((b) => b.id === item.book_id);
    if (!book) {
      throw new AppError(`Book with ID ${item.book_id} not found`, 404);
    }
    if (book.stockQuantity < item.quantity) {
      throw new AppError(`Not enough stock for book: ${book.title}`, 400);
    }

    totalQuantity += item.quantity;
    totalPrice += book.price * item.quantity;

    orderItemsData.push({
      bookId: item.book_id,
      quantity: item.quantity,
      priceAtBuy: book.price, // Simpan harga saat ini
    });
  }

  // 2. Jalankan pembuatan order dan update stok dalam satu transaksi database
  const result = await prisma.$transaction(async (tx) => {
    // Buat Order (Transaction)
    const order = await tx.order.create({
      data: {
        userId,
      },
    });

    // Buat OrderItems (TransactionItems)
    await tx.orderItem.createMany({
      data: orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      })),
    });

    // Update stok buku
    for (const item of items) {
      await tx.book.update({
        where: { id: item.book_id },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return { orderId: order.id, totalQuantity, totalPrice };
  });

  return {
    transaction_id: result.orderId,
    total_quantity: result.totalQuantity,
    total_price: result.totalPrice,
  };
};

export const getAllTransactions = async (query: any) => {
  // Logic pagination/filter untuk transactions (Orders)
  // ... (Mirip dengan service genre/buku, tapi untuk 'Order')
  // Ini adalah versi sederhana, Anda bisa tambahkan filter dari Postman
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const orders = await prisma.order.findMany({
      skip,
      take: limit,
      include: {
          items: true
      },
      orderBy: {
          createdAt: 'desc'
      }
  });

  // Hitung total quantity dan price untuk setiap order
  const formattedOrders = orders.map(order => {
      let total_quantity = 0;
      let total_price = 0;
      order.items.forEach(item => {
          total_quantity += item.quantity;
          total_price += item.priceAtBuy * item.quantity;
      });
      return {
          id: order.id,
          total_quantity,
          total_price,
          created_at: order.createdAt
      };
  });
  
  return { data: formattedOrders, meta: { page, limit } }; // Sederhana, tambahkan meta lengkap jika perlu
};

export const getTransactionById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          book: { // Ambil info buku
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Transaction not found', 404);
  }

  let total_quantity = 0;
  let total_price = 0;

  const formattedItems = order.items.map((item) => {
    const subtotal = item.priceAtBuy * item.quantity;
    total_quantity += item.quantity;
    total_price += subtotal;
    return {
      book_id: item.bookId,
      book_title: item.book.title,
      quantity: item.quantity,
      subtotal_price: subtotal,
    };
  });

  return {
    id: order.id,
    items: formattedItems,
    total_quantity,
    total_price,
    created_at: order.createdAt
  };
};

export const getTransactionStatistics = async () => {
    // 1. Total Transaksi
    const total_transactions = await prisma.order.count();
    
    // 2. Rata-rata nominal
    const orderItems = await prisma.orderItem.findMany();
    let totalRevenue = 0;
    orderItems.forEach(item => {
        totalRevenue += item.priceAtBuy * item.quantity;
    });
    const average_transaction_amount = total_transactions > 0 ? totalRevenue / total_transactions : 0;

    // 3. & 4. Statistik Genre
    const genreStats = await prisma.orderItem.groupBy({
        by: ['bookId'],
        _sum: {
            quantity: true,
        },
    });

    if (genreStats.length === 0) {
        return {
            total_transactions,
            average_transaction_amount,
            most_book_sales_genre: "N/A",
            fewest_book_sales_genre: "N/A"
        }
    }

    const bookGenres = await prisma.book.findMany({
        where: {
            id: { in: genreStats.map(stat => stat.bookId) }
        },
        select: {
            id: true,
            genreId: true,
            genre: {
                select: { name: true }
            }
        }
    });

    const genreSales = new Map<string, number>();

    for (const stat of genreStats) {
        const book = bookGenres.find(b => b.id === stat.bookId);
        if (book) {
            const genreName = book.genre.name;
            const currentSales = genreSales.get(genreName) || 0;
            genreSales.set(genreName, currentSales + (stat._sum.quantity || 0));
        }
    }

    if (genreSales.size === 0) {
       return {
            total_transactions,
            average_transaction_amount,
            most_book_sales_genre: "N/A",
            fewest_book_sales_genre: "N/A"
        } 
    }

    const sortedGenres = [...genreSales.entries()].sort((a, b) => a[1] - b[1]);

    const fewest_book_sales_genre = sortedGenres[0][0];
    const most_book_sales_genre = sortedGenres[sortedGenres.length - 1][0];

    return {
        total_transactions,
        average_transaction_amount: parseFloat(average_transaction_amount.toFixed(2)),
        most_book_sales_genre,
        fewest_book_sales_genre
    };
};
