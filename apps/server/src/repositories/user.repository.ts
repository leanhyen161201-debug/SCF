import { prisma } from './base.repository';
import { UserRole, UserStatus } from '@prisma/client';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findAll(skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count(),
    ]);
    return { items, total };
  },

  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }) {
    return prisma.user.create({ data });
  },

  async updateStatus(id: string, status: UserStatus) {
    return prisma.user.update({ where: { id }, data: { status } });
  },
};
