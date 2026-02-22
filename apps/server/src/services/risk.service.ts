import { riskRepository } from '../repositories/risk.repository';
import { NotFoundError } from '../utils/errors';

export const riskService = {
  async listEvents(page: number, pageSize: number, filters?: {
    type?: string;
    status?: string;
    severity?: string;
    enterpriseId?: string;
  }) {
    const skip = (page - 1) * pageSize;
    return riskRepository.findAll(skip, pageSize, filters as Parameters<typeof riskRepository.findAll>[2]);
  },

  async getEvent(id: string) {
    const event = await riskRepository.findById(id);
    if (!event) throw new NotFoundError('Risk event');
    return event;
  },

  async handleEvent(id: string, userId: string, data: {
    status: string;
    handleNote?: string;
  }) {
    const event = await riskRepository.findById(id);
    if (!event) throw new NotFoundError('Risk event');

    return riskRepository.handle(id, {
      status: data.status as 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'ESCALATED',
      handledBy: userId,
      handleNote: data.handleNote,
    });
  },

  async getRules() {
    // Return default rules (could be stored in DB in the future)
    return [
      {
        id: '1',
        name: 'Overdue 1 Day Freeze',
        code: 'OVERDUE_1DAY_FREEZE',
        description: 'Freeze enterprise account when any order is overdue by 1 day',
        type: 'OVERDUE',
        threshold: 1,
        action: 'FREEZE',
        severity: 'CRITICAL',
        isActive: true,
      },
      {
        id: '2',
        name: 'Return Rate 15% Block',
        code: 'RETURN_RATE_15_BLOCK',
        description: 'Block new orders when 90-day return rate exceeds 15%',
        type: 'HIGH_RETURN_RATE',
        threshold: 0.15,
        action: 'BLOCK',
        severity: 'HIGH',
        isActive: true,
      },
      {
        id: '3',
        name: 'Amount Mismatch Reject',
        code: 'AMOUNT_MISMATCH_REJECT',
        description: 'Auto-reject triple-match when amount deviation exceeds 1%',
        type: 'AMOUNT_MISMATCH',
        threshold: 0.01,
        action: 'REJECT',
        severity: 'HIGH',
        isActive: true,
      },
    ];
  },
};
