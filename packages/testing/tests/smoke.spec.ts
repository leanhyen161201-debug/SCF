import { test, expect } from '@playwright/test';

test.describe('Smoke — Login Page', () => {
  test('首页可访问且显示 Supply Chain Finance System', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Supply Chain Finance System')).toBeVisible();
  });
});
