import { orderRepository } from '../repositories/order.repository';
import { enterpriseRepository } from '../repositories/enterprise.repository';
import { NotFoundError, BusinessError } from '../utils/errors';
import { generateId } from '../utils/helpers';
import { ORDER_STATUS_TRANSITIONS, OrderStatus } from '@scf/shared';

export const orderService = {
  async list(page: number, pageSize: number, filters?: {
    status?: string;
    enterpriseId?: string;
    isOverdue?: boolean;
  }) {
    const skip = (page - 1) * pageSize;
    return orderRepository.findAll(skip, pageSize, filters as Parameters<typeof orderRepository.findAll>[2]);
  },

  async getById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError('Order');
    return order;
  },

  async create(data: { enterpriseId: string; amount: number; dueDate?: string }) {
    const enterprise = await enterpriseRepository.findById(data.enterpriseId);
    if (!enterprise) throw new NotFoundError('Enterprise');
    if (enterprise.status !== 'ACTIVE') {
      throw new BusinessError('Enterprise is frozen or blacklisted, cannot create orders');
    }

    return orderRepository.create({
      orderNo: generateId('ORD'),
      enterpriseId: data.enterpriseId,
      amount: data.amount,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  },

  async updateStatus(id: string, newStatus: OrderStatus) {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError('Order');

    const currentStatus = order.status as OrderStatus;
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BusinessError(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(', ')}`
      );
    }

    return orderRepository.updateStatus(id, newStatus as Parameters<typeof orderRepository.updateStatus>[1]);
  },

  async applyFinancing(id: string, amount: number) {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError('Order');
    if (order.status === 'CANCELLED' || order.status === 'RETURNED') {
      throw new BusinessError('Cannot apply financing for cancelled or returned orders');
    }

    return orderRepository.updateFinancingStatus(id, 'APPLIED');
  },
};
