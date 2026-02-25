import { prisma } from './base.repository';
import { OrderStatus, FinancingStatus } from '../generated/prisma/client';

export const orderRepository = {
  async findAll(skip: number, take: number, filters?: {
    status?: OrderStatus;
    enterpriseId?: string;
    isOverdue?: boolean;
  }) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.enterpriseId) where.enterpriseId = filters.enterpriseId;
    if (filters?.isOverdue) {
      where.dueDate = { lt: new Date() };
      where.repaidAt = null;
      where.status = { notIn: ['CANCELLED', 'RETURNED'] as OrderStatus[] };
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { enterprise: { select: { name: true } } },
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        enterprise: { select: { name: true } },
        documents: true,
      },
    });
  },

  async create(data: {
    orderNo: string;
    enterpriseId: string;
    amount: number;
    dueDate?: Date;
  }) {
    return prisma.order.create({ data: { ...data, amount: data.amount } });
  },

  async updateStatus(id: string, status: OrderStatus) {
    const data: Record<string, unknown> = { status };
    if (status === 'RETURNED') data.isReturned = true;
    return prisma.order.update({ where: { id }, data });
  },

  async updateFinancingStatus(id: string, financingStatus: FinancingStatus) {
    return prisma.order.update({ where: { id }, data: { financingStatus } });
  },

  async updateOverdueDays(id: string, overdueDays: number) {
    return prisma.order.update({ where: { id }, data: { overdueDays } });
  },

  async findOverdue() {
    return prisma.order.findMany({
      where: {
        dueDate: { lt: new Date() },
        repaidAt: null,
        status: { notIn: ['CANCELLED', 'RETURNED'] },
      },
      include: { enterprise: { select: { name: true, status: true } } },
    });
  },

  async getReturnStats(enterpriseId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalCount, returnedCount] = await Promise.all([
      prisma.order.count({
        where: { enterpriseId, createdAt: { gte: since } },
      }),
      prisma.order.count({
        where: { enterpriseId, createdAt: { gte: since }, isReturned: true },
      }),
    ]);
    return { totalCount, returnedCount };
  },

  async countByEnterprise(enterpriseId: string, since?: Date) {
    const where: Record<string, unknown> = { enterpriseId };
    if (since) where.createdAt = { gte: since };
    return prisma.order.count({ where });
  },

  async getOrderStats() {
    const [active, overdue, total] = await Promise.all([
      prisma.order.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'RETURNED'] } } }),
      prisma.order.count({
        where: { dueDate: { lt: new Date() }, repaidAt: null, status: { notIn: ['CANCELLED', 'RETURNED'] } },
      }),
      prisma.order.count(),
    ]);
    return { active, overdue, total };
  },
};
