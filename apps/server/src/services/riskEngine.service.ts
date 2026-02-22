import { orderRepository } from '../repositories/order.repository';
import { enterpriseRepository } from '../repositories/enterprise.repository';
import { riskRepository } from '../repositories/risk.repository';
import { limitRepository } from '../repositories/limit.repository';
import { generateId, diffInDays } from '../utils/helpers';
import logger from '../utils/logger';
import { RETURN_RATE_THRESHOLD } from '@scf/shared';

export const riskEngineService = {
  /**
   * Check for overdue orders and freeze accounts
   * Rule: Any order overdue >= 1 day triggers account freeze
   */
  async checkOverdueOrders() {
    logger.info('Running overdue order check...');
    const overdueOrders = await orderRepository.findOverdue();
    let processed = 0;

    for (const order of overdueOrders) {
      if (!order.dueDate) continue;

      const overdueDays = diffInDays(new Date(), order.dueDate);
      if (overdueDays < 1) continue;

      // Update overdue days
      await orderRepository.updateOverdueDays(order.id, overdueDays);
      await orderRepository.updateFinancingStatus(order.id, 'OVERDUE');

      // Check if we already have an open event for this enterprise
      const hasOpenEvent = await riskRepository.hasOpenEventForEnterprise(
        order.enterpriseId,
        'OVERDUE'
      );

      if (!hasOpenEvent) {
        // Freeze enterprise
        await enterpriseRepository.updateStatus(order.enterpriseId, 'FROZEN');

        // Create risk event
        await riskRepository.create({
          eventNo: generateId('RE'),
          enterpriseId: order.enterpriseId,
          type: 'OVERDUE',
          severity: 'CRITICAL',
          description: `Order ${order.orderNo} overdue by ${overdueDays} day(s). Enterprise account has been automatically frozen.`,
          triggerRule: 'OVERDUE_1DAY_FREEZE',
          triggerValue: `${overdueDays} days`,
          thresholdValue: '1 day',
          action: 'FREEZE',
        });

        // Freeze credit limit
        await limitRepository.freezeLimit(order.enterpriseId);

        logger.warn(`Enterprise ${order.enterpriseId} frozen due to overdue order ${order.orderNo} (${overdueDays} days)`);
        processed++;
      }
    }

    logger.info(`Overdue check complete. Processed: ${processed} enterprises`);
    return { processed, total: overdueOrders.length };
  },

  /**
   * Check return rates for all active enterprises
   * Rule: 90-day return rate > 15% triggers order blocking
   */
  async checkReturnRates() {
    logger.info('Running return rate check...');
    const enterprises = await enterpriseRepository.findAllActive();
    let processed = 0;

    for (const ent of enterprises) {
      const stats = await orderRepository.getReturnStats(ent.id, 90);
      if (stats.totalCount === 0) continue;

      const returnRate = stats.returnedCount / stats.totalCount;

      if (returnRate > RETURN_RATE_THRESHOLD) {
        // Check if we already have an open event
        const hasOpenEvent = await riskRepository.hasOpenEventForEnterprise(
          ent.id,
          'HIGH_RETURN_RATE'
        );

        if (!hasOpenEvent) {
          // Freeze enterprise
          await enterpriseRepository.updateStatus(ent.id, 'FROZEN');

          // Create risk event
          await riskRepository.create({
            eventNo: generateId('RE'),
            enterpriseId: ent.id,
            type: 'HIGH_RETURN_RATE',
            severity: 'HIGH',
            description: `Enterprise ${ent.name} has a 90-day return rate of ${(returnRate * 100).toFixed(1)}%, exceeding the 15% threshold. New orders blocked.`,
            triggerRule: 'RETURN_RATE_15_BLOCK',
            triggerValue: `${(returnRate * 100).toFixed(1)}%`,
            thresholdValue: '15%',
            action: 'BLOCK',
          });

          logger.warn(`Enterprise ${ent.id} (${ent.name}) blocked: return rate ${(returnRate * 100).toFixed(1)}%`);
          processed++;
        }
      }
    }

    logger.info(`Return rate check complete. Processed: ${processed} enterprises`);
    return { processed, total: enterprises.length };
  },
};
