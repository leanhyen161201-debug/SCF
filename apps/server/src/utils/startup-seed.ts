import bcrypt from 'bcryptjs';
import { prisma } from '../repositories/base.repository';
import logger from './logger';

/**
 * Ensures the default seed users exist before the HTTP server starts.
 *
 * Why here instead of only in the build command:
 *   Render may have a dashboard build-command override that supersedes
 *   render.yaml, silently skipping `prisma db seed`. Running this check
 *   at startup guarantees login always works regardless of how the service
 *   was deployed.
 *
 * Cost: one `prisma.user.count()` query per cold-start — negligible.
 * When users already exist the function returns immediately with no writes.
 */
export async function ensureSeedUsers(): Promise<void> {
  const count = await prisma.user.count();
  if (count > 0) return;

  logger.info('No users found — seeding default accounts...');
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      { username: 'admin',          email: 'admin@scf.com',   passwordHash, role: 'ADMIN' },
      { username: 'risk_manager',   email: 'risk@scf.com',    passwordHash, role: 'RISK_MANAGER' },
      { username: 'credit_officer', email: 'credit@scf.com',  passwordHash, role: 'CREDIT_OFFICER' },
      { username: 'operator',       email: 'operator@scf.com', passwordHash, role: 'OPERATOR' },
    ],
    skipDuplicates: true,
  });

  logger.info('Default accounts seeded successfully');
}
