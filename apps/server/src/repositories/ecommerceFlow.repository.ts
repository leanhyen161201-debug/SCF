import { prisma } from './base.repository';

export const ecommerceFlowRepository = {
  async findByEnterprise(enterpriseId: string, since: Date) {
    return prisma.ecommerceFlow.findMany({
      where: {
        enterpriseId,
        transactionDate: { gte: since },
      },
      orderBy: { transactionDate: 'asc' },
    });
  },

  async upsertBatch(enterpriseId: string, flows: Array<{
    platform: string;
    transactionDate: Date;
    amount: number;
    transactionType: string;
    orderRef?: string;
  }>) {
    const operations = flows.map((flow) =>
      prisma.ecommerceFlow.create({
        data: { enterpriseId, ...flow, amount: flow.amount },
      })
    );
    return prisma.$transaction(operations);
  },

  async getMonthlyVolumes(enterpriseId: string, months: number) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const flows = await prisma.ecommerceFlow.findMany({
      where: { enterpriseId, transactionDate: { gte: since } },
      orderBy: { transactionDate: 'asc' },
    });

    const monthlyData: Record<string, number> = {};
    for (const flow of flows) {
      const key = `${flow.transactionDate.getFullYear()}-${String(flow.transactionDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + Number(flow.amount);
    }

    return monthlyData;
  },
};
