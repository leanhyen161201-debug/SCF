import { limitRepository } from '../repositories/limit.repository';
import { orderRepository } from '../repositories/order.repository';
import { ecommerceFlowRepository } from '../repositories/ecommerceFlow.repository';
import { enterpriseRepository } from '../repositories/enterprise.repository';
import { NotFoundError, BusinessError } from '../utils/errors';
import {
  BASE_AMOUNT,
  VOLUME_REFERENCE,
  FREQUENCY_REFERENCE,
  FLOW_WEIGHTS,
  RISK_WEIGHTS,
  OVERDUE_RATE_HARD_LIMIT,
  RETURN_RATE_HARD_LIMIT,
  INDUSTRY_FACTORS,
  MIN_CREDIT_LIMIT,
  MAX_CREDIT_LIMIT,
} from '@scf/shared';

export const limitService = {
  async getByEnterprise(enterpriseId: string) {
    const limit = await limitRepository.findByEnterprise(enterpriseId);
    if (!limit) throw new NotFoundError('Credit limit');
    return limit;
  },

  async listAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return limitRepository.findAll(skip, pageSize);
  },

  async calculate(enterpriseId: string) {
    const enterprise = await enterpriseRepository.findById(enterpriseId);
    if (!enterprise) throw new NotFoundError('Enterprise');

    // Get 90-day data
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const [flows, returnStats, orders] = await Promise.all([
      ecommerceFlowRepository.findByEnterprise(enterpriseId, since),
      orderRepository.getReturnStats(enterpriseId, 90),
      orderRepository.findAll(0, 1000, { enterpriseId }),
    ]);

    // Calculate flow metrics
    const totalVolume = flows.reduce((sum, f) => sum + Number(f.amount), 0);
    const avgMonthlyVolume = totalVolume / 3;
    const transactionCount = flows.length;

    // Growth rate (compare month-over-month)
    const monthlyVolumes = await ecommerceFlowRepository.getMonthlyVolumes(enterpriseId, 3);
    const volumeValues = Object.values(monthlyVolumes);
    let growthRate = 0;
    if (volumeValues.length >= 2) {
      const lastMonth = volumeValues[volumeValues.length - 1] || 0;
      const prevMonth = volumeValues[volumeValues.length - 2] || 1;
      growthRate = (lastMonth - prevMonth) / (prevMonth || 1);
    }

    // Risk metrics
    const overdueRate = orders.total > 0
      ? (orders.items as Array<{ overdueDays: number }>).filter((o) => o.overdueDays > 0).length / orders.total
      : 0;
    const returnRate = returnStats.totalCount > 0
      ? returnStats.returnedCount / returnStats.totalCount
      : 0;
    const latePaymentRatio = overdueRate * 0.5; // Simplified

    // FlowScore calculation
    const vNorm = Math.min(avgMonthlyVolume / VOLUME_REFERENCE, 2);
    const fNorm = Math.min(transactionCount / FREQUENCY_REFERENCE, 2);
    const gNorm = Math.max(growthRate + 1, 0);
    const flowScore = FLOW_WEIGHTS.volume * vNorm + FLOW_WEIGHTS.frequency * fNorm + FLOW_WEIGHTS.growth * gNorm;

    // RiskMultiplier - Hard red lines
    if (overdueRate > OVERDUE_RATE_HARD_LIMIT || returnRate > RETURN_RATE_HARD_LIMIT) {
      // Store zero limit
      await limitRepository.upsert(enterpriseId, {
        totalLimit: 0,
        availableLimit: 0,
        suggestedLimit: 0,
        algorithm: 'v1.0',
        calculationData: {
          avgMonthlyVolume, transactionCount, growthRate,
          overdueRate, returnRate, latePaymentRatio,
          flowScore, riskMultiplier: 0, industryFactor: 0,
          reason: 'Hard red line breached',
        },
      });
      throw new BusinessError(
        `Credit denied: overdueRate=${(overdueRate * 100).toFixed(1)}%, returnRate=${(returnRate * 100).toFixed(1)}%`
      );
    }

    const riskMultiplier = Math.max(0, 1 - (
      RISK_WEIGHTS.overdue * overdueRate +
      RISK_WEIGHTS.returnRate * returnRate +
      RISK_WEIGHTS.latePayment * latePaymentRatio
    ));

    // Industry factor
    const industryFactor = INDUSTRY_FACTORS[enterprise.industry || ''] || INDUSTRY_FACTORS['default'];

    // Final calculation
    let calculatedLimit = BASE_AMOUNT * flowScore * riskMultiplier * industryFactor;
    calculatedLimit = Math.round(calculatedLimit / 1000) * 1000; // Round to nearest 1000
    calculatedLimit = Math.max(MIN_CREDIT_LIMIT, Math.min(MAX_CREDIT_LIMIT, calculatedLimit));

    const calculationData = {
      avgMonthlyVolume,
      transactionCount,
      growthRate,
      overdueRate,
      returnRate,
      latePaymentRatio,
      flowScore,
      riskMultiplier,
      industryFactor,
      baseAmount: BASE_AMOUNT,
    };

    const result = await limitRepository.upsert(enterpriseId, {
      totalLimit: calculatedLimit,
      availableLimit: calculatedLimit,
      suggestedLimit: calculatedLimit,
      algorithm: 'v1.0',
      calculationData,
    });

    return result;
  },

  async adjust(enterpriseId: string, data: { newLimit: number; reason: string }, adjustedBy: string) {
    const limit = await limitRepository.findByEnterprise(enterpriseId);
    if (!limit) throw new NotFoundError('Credit limit');

    return limitRepository.adjust(limit.id, {
      previousLimit: Number(limit.totalLimit),
      newLimit: data.newLimit,
      reason: data.reason,
      adjustedBy,
    });
  },

  async getHistory(enterpriseId: string) {
    return limitRepository.getAdjustmentHistory(enterpriseId);
  },
};
