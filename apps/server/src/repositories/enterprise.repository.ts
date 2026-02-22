import { prisma } from './base.repository';
import { EnterpriseStatus } from '@prisma/client';

export const enterpriseRepository = {
  async findAll(skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.enterprise.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.enterprise.count(),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    return prisma.enterprise.findUnique({ where: { id } });
  },

  async findAllActive() {
    return prisma.enterprise.findMany({ where: { status: 'ACTIVE' } });
  },

  async updateStatus(id: string, status: EnterpriseStatus) {
    return prisma.enterprise.update({ where: { id }, data: { status } });
  },

  async create(data: {
    name: string;
    unifiedCode: string;
    contactPerson: string;
    contactPhone: string;
    address?: string;
    industry?: string;
    registeredCapital?: number;
  }) {
    return prisma.enterprise.create({
      data: {
        ...data,
        registeredCapital: data.registeredCapital ? data.registeredCapital : undefined,
      },
    });
  },
};
