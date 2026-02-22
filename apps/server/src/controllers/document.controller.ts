import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { z } from 'zod';
import { documentService } from '../services/document.service';
import { documentReviewService } from '../services/documentReview.service';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/helpers';

const matchSchema = z.object({
  contractId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  logisticsId: z.string().uuid(),
});

export const documentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = parsePagination(req.query);
      const filters = {
        type: req.query.type as string | undefined,
        status: req.query.status as string | undefined,
        orderId: req.query.orderId as string | undefined,
        creditAppId: req.query.creditAppId as string | undefined,
      };
      const { items, total } = await documentService.list(page, pageSize, filters);
      sendPaginated(res, items, total, page, pageSize);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await documentService.getById(req.params.id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const data = await documentService.upload({
        type: req.body.type || 'OTHER',
        orderId: req.body.orderId,
        creditAppId: req.body.creditAppId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
      });
      sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  },

  async getImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { filePath, mimeType, fileName } = await documentService.getImage(req.params.id);
      const absolutePath = path.resolve(filePath);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.sendFile(absolutePath);
    } catch (error) {
      next(error);
    }
  },

  async extract(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentReviewService.extractFields(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async match(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractId, invoiceId, logisticsId } = matchSchema.parse(req.body);
      const result = await documentReviewService.matchDocuments(contractId, invoiceId, logisticsId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
