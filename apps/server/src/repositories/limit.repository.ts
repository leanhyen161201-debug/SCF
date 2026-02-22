import { prisma } from './base.repository';

export const limitRepository = {
  async findByEnterprise(enterpriseId: string) {
    return prisma.creditLimit.findUnique({
      where: { enterpriseId },
      include: {
        enterprise: { select: { name: true } },
        adjustments: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
  },

  async findAll(skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.creditLimit.findMany({
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: { enterprise: { select: { name: true } } },
      }),
      prisma.creditLimit.count(),
    ]);
    return { items, total };
  },

  async upsert(enterpriseId: string, data: {
    totalLimit: number;
    availableLimit: number;
    suggestedLimit?: number;
    algorithm?: string;
    calculationData?: Record<string, unknown>;
  }) {
    return prisma.creditLimit.upsert({
      where: { enterpriseId },
      create: {
        enterpriseId,
        totalLimit: data.totalLimit,
        availableLimit: data.availableLimit,
        usedLimit: 0,
        suggestedLimit: data.suggestedLimit,
        algorithm: data.algorithm,
        calculationData: data.calculationData as object,
        lastCalculatedAt: new Date(),
      },
      update: {
        totalLimit: data.totalLimit,
        availableLimit: data.availableLimit,
        suggestedLimit: data.suggestedLimit,
        algorithm: data.algorithm,
        calculationData: data.calculationData as object,
        lastCalculatedAt: new Date(),
      },
    });
  },

  async adjust(creditLimitId: string, data: {
    previousLimit: number;
    newLimit: number;
    reason: string;
    adjustedBy: string;
  }) {
    const [adjustment] = await prisma.$transaction([
      prisma.limitAdjustment.create({ data: { creditLimitId, ...data } }),
      prisma.creditLimit.update({
        where: { id: creditLimitId },
        data: {
          totalLimit: data.newLimit,
          availableLimit: data.newLimit,
        },
      }),
    ]);
    return adjustment;
  },

  async getAdjustmentHistory(enterpriseId: string) {
    const limit = await prisma.creditLimit.findUnique({ where: { enterpriseId } });
    if (!limit) return [];
    return prisma.limitAdjustment.findMany({
      where: { creditLimitId: limit.id },
      orderBy: { createdAt: 'desc' },
    });
  },

  async freezeLimit(enterpriseId: string) {
    const limit = await prisma.creditLimit.findUnique({ where: { enterpriseId } });
    if (!limit) return null;
    return prisma.creditLimit.update({
      where: { id: limit.id },
      data: { availableLimit: 0 },
    });
  },
};
