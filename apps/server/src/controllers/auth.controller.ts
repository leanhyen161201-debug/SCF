import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/helpers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'RISK_MANAGER', 'CREDIT_OFFICER', 'OPERATOR']).optional(),
});

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.getProfile(req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    sendSuccess(res, { message: 'Logged out' });
  },
};
