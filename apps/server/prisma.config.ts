// Plain object export required for Prisma 7.4+ config.
// Do NOT import from 'prisma/config' — that subpath is unresolvable in some pnpm layouts.
// Prisma CLI reads the plain default export directly; defineConfig is a no-op wrapper.
// PrismaConfigShape uses datasource.url (NOT top-level datasourceUrl) — onExcessProperty: "error"
// rejects unknown fields, so the correct nesting is required.
export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
}
