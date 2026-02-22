import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import { AuthPayload } from '../middleware/auth';

export const authService = {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is disabled');
    }

    const payload: AuthPayload = {
      userId: user.id,
      role: user.role as AuthPayload['role'],
      email: user.email,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  },

  async register(data: { username: string; email: string; password: string; role?: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      username: data.username,
      email: data.email,
      passwordHash,
      role: (data.role as 'ADMIN' | 'RISK_MANAGER' | 'CREDIT_OFFICER' | 'OPERATOR') || 'OPERATOR',
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  },

  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
      const user = await userRepository.findById(payload.userId);
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedError('User not found or disabled');
      }

      const newPayload: AuthPayload = {
        userId: user.id,
        role: user.role as AuthPayload['role'],
        email: user.email,
      };

      const accessToken = jwt.sign(newPayload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  },
};
