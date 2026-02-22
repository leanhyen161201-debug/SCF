import cron from 'node-cron';
import { riskEngineService } from '../services/riskEngine.service';
import logger from '../utils/logger';

export function startScheduledJobs() {
  // Check overdue orders every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await riskEngineService.checkOverdueOrders();
    } catch (error) {
      logger.error('Overdue check job failed:', error);
    }
  });

  // Check return rates daily at 02:00
  cron.schedule('0 2 * * *', async () => {
    try {
      await riskEngineService.checkReturnRates();
    } catch (error) {
      logger.error('Return rate check job failed:', error);
    }
  });

  logger.info('Scheduled jobs started: overdue check (hourly), return rate check (daily 02:00)');
}
