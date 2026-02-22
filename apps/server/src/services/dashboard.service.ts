import { creditRepository } from '../repositories/credit.repository';
import { orderRepository } from '../repositories/order.repository';
import { riskRepository } from '../repositories/risk.repository';
import { limitRepository } from '../repositories/limit.repository';
import { prisma } from '../repositories/base.repository';

export const dashboardService = {
  async getOverview() {
    const [
      pendingApplications,
      orderStats,
      riskCounts,
      creditLimits,
    ] = await Promise.all([
      creditRepository.countByStatus('PENDING'),
      orderRepository.getOrderStats(),
      riskRepository.countBySeverity(),
      prisma.creditLimit.aggregate({
        _sum: { totalLimit: true, usedLimit: true },
      }),
    ]);

    const totalCredit = Number(creditLimits._sum.totalLimit || 0);
    const usedCredit = Number(creditLimits._sum.usedLimit || 0);

    return {
      totalCredit,
      pendingApplications,
      activeOrders: orderStats.active,
      overdueOrders: orderStats.overdue,
      riskEvents: (riskCounts.critical || 0) + (riskCounts.high || 0) + (riskCounts.medium || 0) + (riskCounts.low || 0),
      creditUtilization: totalCredit > 0 ? usedCredit / totalCredit : 0,
      matchSuccessRate: 0, // Will be computed from documents
      totalFinancingAmount: usedCredit,
    };
  },

  async getTrend() {
    const months = 12;
    const data = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const month = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;

      const [orders, credits] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.creditApplication.count({ where: { createdAt: { gte: start, lt: end } } }),
      ]);

      data.push({ month, orders, credits });
    }

    return data;
  },

  async getRiskOverview() {
    return riskRepository.countBySeverity();
  },

  async getRecentAlerts(limit = 10) {
    const events = await riskRepository.findRecent(limit);
    return events.map((e) => ({
      id: e.id,
      eventNo: e.eventNo,
      enterpriseName: (e as Record<string, unknown> & { enterprise: { name: string } }).enterprise.name,
      type: e.type,
      severity: e.severity,
      description: e.description,
      createdAt: e.createdAt.toISOString(),
    }));
  },

  async getKpiDetail(metric: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    switch (metric) {
      case 'overdue-orders':
        return orderRepository.findAll(skip, pageSize, { isOverdue: true });
      case 'pending-applications':
        return creditRepository.findAll(skip, pageSize, { status: 'PENDING' });
      case 'active-orders':
        return orderRepository.findAll(skip, pageSize);
      case 'risk-events':
        return riskRepository.findAll(skip, pageSize, { status: 'PENDING' });
      default:
        return { items: [], total: 0 };
    }
  },
};
