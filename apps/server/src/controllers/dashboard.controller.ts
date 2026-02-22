import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/helpers';

export const dashboardController = {
  async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getOverview();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getTrend(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getTrend();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getRiskOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getRiskOverview();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getRecentAlerts(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getRecentAlerts();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getKpiDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { metric } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const data = await dashboardService.getKpiDetail(metric, page, pageSize);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
