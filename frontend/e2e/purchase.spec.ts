import { test, expect } from '@playwright/test';
test('proposal, approval, and audit flow without credentials', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Find my best fit' }).click();
  await expect(page.getByRole('heading', { name: 'Studio Keyboard' })).toBeVisible();
  await expect(page.getByText('deterministic fallback (non-AI)', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Approve $59.00 USD' }).click();
  await expect(page.getByText('Sandbox checkout is disabled', { exact: false })).toBeVisible();
  await page.getByText('View decision audit').click();
  await expect(page.getByText('HUMAN_APPROVED', { exact: false })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/\u00c2|\u00e2/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `../docs/screenshots/workspace-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(page.getByText('No PayPal order created')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});
test('budget rejection and catalog comparison', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Maximum total (USD)').fill('20');
  await page.getByRole('button', { name: 'Find my best fit' }).click();
  await expect(page.getByRole('status')).toContainText('No matching item');
  await page.getByRole('button', { name: 'Catalog', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Compact Keyboard' })).toBeVisible();
  await expect(page.getByText('$35.00', { exact: true })).toBeVisible();
});

test('checkout buyer approval stays separate from capture with an explicitly mocked SDK', async ({ page }) => {
  let orders = 0;
  let captures = 0;
  let latestProposal: Record<string, unknown> | undefined;
  await page.route('**/api/config', route => route.fulfill({ json: { payments_enabled: true, capture_enabled: false, client_id: 'test-fixture' } }));
  await page.route('**/api/proposals', async route => { const response = await route.fetch(); latestProposal = await response.json(); await route.fulfill({ response, json: latestProposal }); });
  await page.route('https://www.paypal.com/sdk/js?*', route => route.fulfill({ contentType: 'application/javascript', body: `window.paypal = { Buttons(options) { return { async render(target) { const b = document.createElement('button'); b.textContent = 'PayPal SDK fixture'; b.onclick = async () => { await options.createOrder(); await options.onApprove(); }; target.append(b); }, async close() {} }; } };` }));
  await page.route('**/api/proposals/*/order', route => { orders++; return route.fulfill({ json: { id: 'MOCK-ORDER' } }); });
  await page.route('**/api/proposals/*/buyer-approval', route => route.fulfill({ json: { ...latestProposal!, state: 'BUYER_APPROVED', order_id: 'MOCK-ORDER' } }));
  await page.route('**/api/proposals/*/capture', route => { captures++; return route.fulfill({ status: 500 }); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Find my best fit' }).click();
  await expect(page.getByRole('button', { name: 'Approve $59.00 USD' })).toBeVisible();
  expect(orders).toBe(0);
  await expect(page.getByRole('button', { name: 'PayPal SDK fixture' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Approve $59.00 USD' }).click();
  await page.getByRole('button', { name: 'PayPal SDK fixture' }).click();
  expect(orders).toBe(1);
  expect(captures).toBe(0);
  await expect(page.getByText('PayPal buyer approval verified. No capture has occurred.')).toBeVisible();
  await expect(page.getByText('Capture is locked until the owner separately enables and authorizes it.')).toBeVisible();
});
