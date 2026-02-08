import { prisma } from '../../config/database';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/error-handler';
import type { RegisterInput, LoginInput } from '@devdash/shared';
import crypto from 'crypto';

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      locale: input.locale ?? 'it',
      settings: {
        create: {},
      },
    },
    select: { id: true, email: true, firstName: true, lastName: true, locale: true },
  });

  const tokens = await generateTokens(user.id, user.email);

  return { user, tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      locale: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const tokens = await generateTokens(user.id, user.email);

  const { passwordHash: _, ...userData } = user;
  return { user: userData, tokens };
}

export async function refreshTokens(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'INVALID_TOKEN', 'Refresh token expired or revoked');
  }

  // Delete old token
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const tokens = await generateTokens(payload.userId, payload.email);
  return { tokens };
}

export async function logout(userId: string) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, locale: true },
  });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return user;
}

async function generateTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, email });

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}
