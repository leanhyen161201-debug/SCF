"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.describe('Smoke — Login Page', () => {
    (0, test_1.test)('首页可访问且显示 Supply Chain Finance System', async ({ page }) => {
        await page.goto('/');
        await (0, test_1.expect)(page.getByText('Supply Chain Finance System')).toBeVisible();
    });
});
