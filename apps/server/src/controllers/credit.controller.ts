import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { creditService } from '../services/credit.service';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/helpers';

const createSchema = z.object({
  enterpriseId: z.string().uuid(),
  requestedAmount: z.number().positive(),
});

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  approvedAmount: z.number().positive().optional(),
  reviewNote: z.string().optional(),
});

export const creditController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = parsePagination(req.query);
      const filters = {
        status: req.query.status as string | undefined,
        enterpriseId: req.query.enterpriseId as string | undefined,
      };
      const { items, total } = await creditService.list(page, pageSize, filters);
      sendPaginated(res, items, total, page, pageSize);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await creditService.getById(req.params.id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      const data = await creditService.create(body);
      sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  },

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const body = reviewSchema.parse(req.body);
      const data = await creditService.review(req.params.id, req.user!.userId, body);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await creditService.cancel(req.params.id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
