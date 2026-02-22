import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { limitService } from '../services/limit.service';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/helpers';

const adjustSchema = z.object({
  newLimit: z.number().positive(),
  reason: z.string().min(1),
});

export const limitController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = parsePagination(req.query);
      const { items, total } = await limitService.listAll(page, pageSize);
      sendPaginated(res, items, total, page, pageSize);
    } catch (error) {
      next(error);
    }
  },

  async getByEnterprise(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await limitService.getByEnterprise(req.params.enterpriseId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await limitService.calculate(req.params.enterpriseId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async adjust(req: Request, res: Response, next: NextFunction) {
    try {
      const body = adjustSchema.parse(req.body);
      const data = await limitService.adjust(
        req.params.enterpriseId,
        body,
        req.user!.userId
      );
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await limitService.getHistory(req.params.enterpriseId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
