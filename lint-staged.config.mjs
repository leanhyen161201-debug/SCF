/**
 * lint-staged configuration for SCF monorepo
 *
 * Strategy: type-check only the packages that have staged TypeScript files.
 * Using functions (returning commands as strings) so lint-staged does NOT
 * pass the staged file list as CLI arguments — TypeScript needs the whole
 * project context, not individual files.
 *
 * When shared source changes, it is rebuilt first so downstream packages
 * get accurate type information. Commands in an array run SEQUENTIALLY.
 *
 * @param {string[]} stagedFiles - list of staged file paths (absolute)
 * @returns {string[]} commands to run
 */
function buildTypeCheckCommands(stagedFiles) {
  const hasShared = stagedFiles.some((f) => f.includes('packages/shared/'));
  const hasServer = stagedFiles.some((f) => f.includes('apps/server/'));
  const hasWeb    = stagedFiles.some((f) => f.includes('apps/web/'));

  const commands = [];

  if (hasShared) {
    // Rebuild shared first — server + web tsc depend on its dist/
    commands.push('pnpm --filter @scf/shared build');
  }

  if (hasServer) commands.push('pnpm --filter @scf/server lint');
  if (hasWeb)    commands.push('pnpm --filter @scf/web lint');

  return commands;
}

export default {
  // Run TypeScript check for any staged TS/TSX file in the monorepo
  '**/*.{ts,tsx}': buildTypeCheckCommands,
};
