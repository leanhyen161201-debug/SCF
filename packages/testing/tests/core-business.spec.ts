/**
 * 核心业务流程 E2E 测试
 * 测试角色: admin@scf.com（拥有全部权限）
 *
 * 覆盖范围:
 *   T-01  登录流程 — 凭据验证 + 跳转 Dashboard
 *   T-02  Dashboard — overview API 响应 + KPI 卡片渲染
 *   T-03  授信申请管理 — credits API 响应 + 表格数据渲染
 *
 * 慢接口策略:
 *   每个 waitForResponse 均配置独立 timeout (15s)，
 *   不依赖 Playwright 全局 timeout，防止单接口延迟导致整套测试失败。
 */

import { test, expect, type Page } from '@playwright/test';

// ──────────────────────────────────────────────
// 测试凭据（prisma/seed.ts 中预置）
// ──────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@scf.com';
const ADMIN_PASSWORD = 'password123';

// ──────────────────────────────────────────────
// 共享帮助函数
// ──────────────────────────────────────────────

/**
 * 以 admin 身份完成完整登录流程。
 * 流程: goto /login → 填写表单 → 点击提交
 *       → 等待 POST /api/auth/login 响应
 *       → 等待 URL 跳转到 /dashboard
 *
 * 说明: authStore 将 token 写入 localStorage，
 *       后续 page.goto 同一 origin 均可保持登录态。
 */
async function loginAdmin(page: Page): Promise<void> {
  await page.goto('/login');

  await page.locator('#email').fill(ADMIN_EMAIL);
  await page.locator('#password').fill(ADMIN_PASSWORD);

  // 先注册监听器，再触发请求 —— 避免竞态条件
  const loginDone = page.waitForResponse(
    (res) =>
      res.url().includes('/api/auth/login') &&
      res.request().method() === 'POST',
    { timeout: 15_000 },
  );

  // Ant Design 对双字中文按钮自动插入空格，实际渲染为 "登 录"
  // 使用正则兼容两种形式: "登录" / "登 录"
  await page.getByRole('button', { name: /登.?录/ }).click();

  await loginDone;
  await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
}

// ──────────────────────────────────────────────
// 测试套件
// ──────────────────────────────────────────────

test.describe('核心业务流程 — admin@scf.com', () => {
  // ────────────────────────────────────────────
  // T-01  登录流程
  // ────────────────────────────────────────────
  test('T-01 登录: 正确凭据 → 后端返回 accessToken → 跳转 Dashboard', async ({ page }) => {
    await page.goto('/login');

    // 登录页应显示品牌标题
    await expect(page.getByText('Supply Chain Finance System')).toBeVisible();

    // 填写邮箱 / 密码
    // Ant Design Form.Item name="email/password" 生成对应 id，无需额外 data-testid
    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.locator('#password').fill(ADMIN_PASSWORD);

    // ① 先挂起响应监听，② 再触发提交
    const loginResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/auth/login') &&
        res.request().method() === 'POST',
      { timeout: 15_000 },
    );

    // Ant Design 对双字中文按钮自动插入空格，实际渲染为 "登 录"
    await page.getByRole('button', { name: /登.?录/ }).click();

    const loginResponse = await loginResponsePromise;

    // ── API 层断言 ──────────────────────────────
    expect(loginResponse.status(), 'POST /api/auth/login 应返回 200').toBe(200);

    const body = await loginResponse.json();
    expect(body?.data?.accessToken, '响应必须包含 accessToken').toBeTruthy();
    expect(
      body?.data?.user?.email,
      '响应 user.email 应与登录凭据一致',
    ).toBe(ADMIN_EMAIL);

    // ── 页面层断言 ──────────────────────────────
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    await expect(
      page.getByText('仪表盘'),
      'Dashboard 页面标题应可见',
    ).toBeVisible({ timeout: 8_000 });
  });

  // ────────────────────────────────────────────
  // T-02  Dashboard 数据加载
  // ────────────────────────────────────────────
  test('T-02 Dashboard: overview API 返回成功，KPI 卡片正常渲染', async ({ page }) => {
    await loginAdmin(page);

    // page.goto 触发完整浏览器导航，保证 SPA 重新挂载并发出 API 请求。
    // waitForResponse 在 goto 之前注册，确保不遗漏响应。
    const overviewPromise = page.waitForResponse(
      (res) => res.url().includes('/api/dashboard/overview'),
      { timeout: 15_000 },
    );

    await page.goto('/dashboard');

    const overviewResponse = await overviewPromise;

    // ── API 层断言 ──────────────────────────────
    expect(overviewResponse.status(), 'GET /api/dashboard/overview 应返回 200').toBe(200);

    const overviewBody = await overviewResponse.json();
    expect(overviewBody?.data, 'overview 响应 data 字段不应为空').toBeDefined();

    // ── 页面层断言: KPI 卡片标题 ─────────────────
    // DashboardPage.tsx kpiMetrics 定义的全部 6 个卡片标题
    const kpiTitles = [
      '总授信额度',
      '待审申请',
      '活跃订单',
      '逾期订单',
      '风险事件',
      '授信使用率',
    ];

    for (const title of kpiTitles) {
      await expect(
        page.getByText(title),
        `KPI 卡片 "${title}" 应可见`,
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  // ────────────────────────────────────────────
  // T-03  授信申请管理 — 表格数据加载
  // ────────────────────────────────────────────
  test(
    'T-03 授信申请: GET /api/credits 返回成功，表格列标题与数据行均渲染',
    async ({ page }) => {
      await loginAdmin(page);

      // waitForResponse 必须在 goto 之前注册，
      // 否则 API 响应可能在监听器挂载前就已完成（竞态）。
      const creditsPromise = page.waitForResponse(
        (res) =>
          res.url().includes('/api/credits') &&
          res.request().method() === 'GET',
        { timeout: 15_000 },
      );

      await page.goto('/credits');

      const creditsResponse = await creditsPromise;

      // ── API 层断言 ────────────────────────────
      expect(creditsResponse.status(), 'GET /api/credits 应返回 200').toBe(200);

      const creditsBody = await creditsResponse.json();

      // ── 页面层断言: 标题 ───────────────────────
      await expect(
        page.getByText('授信申请管理'),
        '页面标题 "授信申请管理" 应可见',
      ).toBeVisible({ timeout: 10_000 });

      // ── 页面层断言: 表格列标题 ─────────────────
      // CreditListPage.tsx columns 定义的全部列
      const columnHeaders = ['申请编号', '企业名称', '申请金额', '状态', '提交时间', '操作'];

      for (const header of columnHeaders) {
        await expect(
          page.getByRole('columnheader', { name: header }),
          `列标题 "${header}" 应可见`,
        ).toBeVisible({ timeout: 8_000 });
      }

      // ── 页面层断言: 数据行（依赖种子数据） ──────
      // prisma/seed.ts 预置了 3 条授信申请
      // 使用 API 返回的 total 保持测试与种子数据解耦
      // API 返回格式: { success, data: { items, total, page, pageSize } }
      // 先读嵌套 data.total，兼容扁平 total 和直接列表三种格式
      const total: number =
        creditsBody?.data?.total ??
        creditsBody?.total ??
        creditsBody?.data?.length ??
        creditsBody?.list?.length ??
        0;

      if (total > 0) {
        // 分页摘要文本: "共 N 条"
        await expect(
          page.getByText(`共 ${total} 条`),
          `分页应显示 "共 ${total} 条"`,
        ).toBeVisible({ timeout: 10_000 });

        // Ant Design Table 行: 至少第一行可见
        await expect(
          page.locator('.ant-table-row').first(),
          '表格应至少渲染一行数据',
        ).toBeVisible({ timeout: 8_000 });
      } else {
        // 即使无数据，空状态占位也应渲染（表格结构完整）
        await expect(
          page.locator('.ant-table-placeholder'),
          '无数据时应渲染 Ant Design 空状态占位',
        ).toBeVisible({ timeout: 8_000 });
      }
    },
  );

  // ────────────────────────────────────────────
  // T-04  无效凭据登录 — 服务器端配置健康验证
  // ────────────────────────────────────────────
  test('T-04 登录: 无效凭据 → 后端返回 401，非 500', async ({ page }) => {
    // 此测试同时验证两个生产问题的修复：
    //   1. trust proxy 未设置 → express-rate-limit 崩溃 → 500
    //   2. 正确凭据但 seed 未运行 → 用户不存在 → 401
    // 若 trust proxy 配置异常导致 rate-limiter 抛出未捕获异常，返回 500 → 测试失败
    // 若服务器正常，无效凭据必须返回 401
    await page.goto('/login');

    await page.locator('#email').fill('notexist@scf.com');
    await page.locator('#password').fill('wrongpassword');

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/auth/login') &&
        res.request().method() === 'POST',
      { timeout: 15_000 },
    );

    await page.getByRole('button', { name: /登.?录/ }).click();

    const resp = await responsePromise;

    // Buffer body as text BEFORE any assertions — Playwright/CDP may GC the
    // response resource reference after the page re-renders on login failure.
    const statusCode = resp.status();
    let body: Record<string, unknown> | null = null;
    try {
      body = await resp.json();
    } catch {
      // CDP GC tolerated here — statusCode assertion below is the primary check
    }

    expect(
      statusCode,
      '无效凭据应返回 401（非 500 — 500 表示 trust proxy 配置异常）',
    ).toBe(401);

    if (body !== null) {
      expect(body?.success, '响应体 success 字段应为 false').toBe(false);
    }
  });
});
