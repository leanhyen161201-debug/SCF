import { creditRepository } from '../repositories/credit.repository';
import { enterpriseRepository } from '../repositories/enterprise.repository';
import { NotFoundError, BusinessError } from '../utils/errors';
import { generateId } from '../utils/helpers';

export const creditService = {
  async list(page: number, pageSize: number, filters?: { status?: string; enterpriseId?: string }) {
    const skip = (page - 1) * pageSize;
    return creditRepository.findAll(skip, pageSize, filters as Parameters<typeof creditRepository.findAll>[2]);
  },

  async getById(id: string) {
    const app = await creditRepository.findById(id);
    if (!app) throw new NotFoundError('Credit application');
    return app;
  },

  async create(data: { enterpriseId: string; requestedAmount: number }) {
    const enterprise = await enterpriseRepository.findById(data.enterpriseId);
    if (!enterprise) throw new NotFoundError('Enterprise');
    if (enterprise.status !== 'ACTIVE') {
      throw new BusinessError('Enterprise is frozen or blacklisted, cannot apply for credit');
    }

    return creditRepository.create({
      applicationNo: generateId('CA'),
      enterpriseId: data.enterpriseId,
      requestedAmount: data.requestedAmount,
    });
  },

  async review(id: string, reviewerId: string, data: {
    status: 'APPROVED' | 'REJECTED';
    approvedAmount?: number;
    reviewNote?: string;
  }) {
    const app = await creditRepository.findById(id);
    if (!app) throw new NotFoundError('Credit application');
    if (app.status !== 'PENDING' && app.status !== 'UNDER_REVIEW') {
      throw new BusinessError('Application is not in reviewable state');
    }

    return creditRepository.review(id, {
      status: data.status,
      reviewerId,
      approvedAmount: data.approvedAmount,
      reviewNote: data.reviewNote,
    });
  },

  async cancel(id: string) {
    const app = await creditRepository.findById(id);
    if (!app) throw new NotFoundError('Credit application');
    if (app.status !== 'PENDING') {
      throw new BusinessError('Only pending applications can be cancelled');
    }

    return creditRepository.updateStatus(id, 'CANCELLED');
  },
};
