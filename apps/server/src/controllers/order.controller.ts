import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrderStatus } from '@scf/shared';
import { orderService } from '../services/order.service';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/helpers';

const createSchema = z.object({
  enterpriseId: z.string().uuid(),
  amount: z.number().positive(),
  dueDate: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURNED', 'CANCELLED']),
});

export const orderController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = parsePagination(req.query);
      const filters = {
        status: req.query.status as string | undefined,
        enterpriseId: req.query.enterpriseId as string | undefined,
        isOverdue: req.query.isOverdue === 'true',
      };
      const { items, total } = await orderService.list(page, pageSize, filters);
      sendPaginated(res, items, total, page, pageSize);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderService.getById(req.params.id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      const data = await orderService.create(body);
      sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updateStatusSchema.parse(req.body);
      const data = await orderService.updateStatus(req.params.id, status as unknown as OrderStatus);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async applyFinancing(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount } = req.body;
      const data = await orderService.applyFinancing(req.params.id, amount || 0);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
