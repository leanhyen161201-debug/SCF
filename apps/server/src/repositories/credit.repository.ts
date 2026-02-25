import { prisma } from './base.repository';
import { CreditStatus } from '../generated/prisma/client';

export const creditRepository = {
  async findAll(skip: number, take: number, filters?: { status?: CreditStatus; enterpriseId?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.enterpriseId) where.enterpriseId = filters.enterpriseId;

    const [items, total] = await Promise.all([
      prisma.creditApplication.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { enterprise: { select: { name: true } } },
      }),
      prisma.creditApplication.count({ where }),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    return prisma.creditApplication.findUnique({
      where: { id },
      include: {
        enterprise: { select: { name: true } },
        documents: true,
      },
    });
  },

  async create(data: {
    applicationNo: string;
    enterpriseId: string;
    requestedAmount: number;
  }) {
    return prisma.creditApplication.create({
      data: {
        ...data,
        requestedAmount: data.requestedAmount,
      },
    });
  },

  async review(id: string, data: {
    status: CreditStatus;
    reviewerId: string;
    approvedAmount?: number;
    reviewNote?: string;
    riskScore?: number;
  }) {
    return prisma.creditApplication.update({
      where: { id },
      data: {
        ...data,
        approvedAmount: data.approvedAmount,
        reviewedAt: new Date(),
      },
    });
  },

  async updateStatus(id: string, status: CreditStatus) {
    return prisma.creditApplication.update({
      where: { id },
      data: { status },
    });
  },

  async countByStatus(status: CreditStatus) {
    return prisma.creditApplication.count({ where: { status } });
  },
};
