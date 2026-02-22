import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { riskService } from '../services/risk.service';
import { riskEngineService } from '../services/riskEngine.service';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/helpers';

const handleSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'RESOLVED', 'ESCALATED']),
  handleNote: z.string().optional(),
});

export const riskController = {
  async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = parsePagination(req.query);
      const filters = {
        type: req.query.type as string | undefined,
        status: req.query.status as string | undefined,
        severity: req.query.severity as string | undefined,
        enterpriseId: req.query.enterpriseId as string | undefined,
      };
      const { items, total } = await riskService.listEvents(page, pageSize, filters);
      sendPaginated(res, items, total, page, pageSize);
    } catch (error) {
      next(error);
    }
  },

  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await riskService.getEvent(req.params.id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async handleEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const body = handleSchema.parse(req.body);
      const data = await riskService.handleEvent(req.params.id, req.user!.userId, body);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getRules(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await riskService.getRules();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async triggerOverdueScan(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await riskEngineService.checkOverdueOrders();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async triggerReturnRateScan(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await riskEngineService.checkReturnRates();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
