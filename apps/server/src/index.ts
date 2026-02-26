import app from './app';
import { config } from './config';
import logger from './utils/logger';
import { startScheduledJobs } from './jobs/scheduler';
import { ensureSeedUsers } from './utils/startup-seed';

async function main() {
  await ensureSeedUsers();

  const server = app.listen(config.port, () => {
    logger.info(`SCF Server running on port ${config.port} in ${config.nodeEnv} mode`);
    startScheduledJobs();
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down...');
    server.close(() => process.exit(0));
  });
}

main().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
