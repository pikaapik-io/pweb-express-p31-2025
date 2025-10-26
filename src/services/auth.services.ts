import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt.utils';
import { AppError } from '../utils/AppError';

export const registerUser = async (body: any) => {
  const { email, password, username } = body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (body: any) => {
  const { email, password } = body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  // Buat token
  const token = signToken({ id: user.id });

  return { access_token: token };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
