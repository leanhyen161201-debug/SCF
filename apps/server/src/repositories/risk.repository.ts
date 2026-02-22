import { prisma } from './base.repository';
import { RiskEventType, RiskEventStatus, RiskSeverity } from '@prisma/client';

export const riskRepository = {
  async findAll(skip: number, take: number, filters?: {
    type?: RiskEventType;
    status?: RiskEventStatus;
    severity?: RiskSeverity;
    enterpriseId?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.enterpriseId) where.enterpriseId = filters.enterpriseId;

    const [items, total] = await Promise.all([
      prisma.riskEvent.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { enterprise: { select: { name: true } } },
      }),
      prisma.riskEvent.count({ where }),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    return prisma.riskEvent.findUnique({
      where: { id },
      include: { enterprise: { select: { name: true } } },
    });
  },

  async create(data: {
    eventNo: string;
    enterpriseId: string;
    type: RiskEventType;
    severity: RiskSeverity;
    description: string;
    triggerRule: string;
    triggerValue: string;
    thresholdValue: string;
    action: 'ALERT' | 'FREEZE' | 'BLOCK' | 'REJECT' | 'MANUAL_REVIEW';
  }) {
    return prisma.riskEvent.create({ data });
  },

  async handle(id: string, data: {
    status: RiskEventStatus;
    handledBy: string;
    handleNote?: string;
  }) {
    return prisma.riskEvent.update({
      where: { id },
      data: { ...data, handledAt: new Date() },
    });
  },

  async countBySeverity() {
    const results = await prisma.riskEvent.groupBy({
      by: ['severity'],
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      _count: true,
    });
    return results.reduce(
      (acc, r) => ({ ...acc, [r.severity.toLowerCase()]: r._count }),
      { low: 0, medium: 0, high: 0, critical: 0 }
    );
  },

  async findRecent(limit: number) {
    return prisma.riskEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { enterprise: { select: { name: true } } },
    });
  },

  async hasOpenEventForEnterprise(enterpriseId: string, type: RiskEventType) {
    const event = await prisma.riskEvent.findFirst({
      where: {
        enterpriseId,
        type,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });
    return !!event;
  },
};
