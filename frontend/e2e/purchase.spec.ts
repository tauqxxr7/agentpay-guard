import { test, expect } from '@playwright/test';
test('proposal, approval, and audit flow without credentials', async ({ page }, testInfo) => {
  const response = await page.goto('/');
  const csp = response?.headers()['content-security-policy'] || '';
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain('https://www.paypal.com');
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
  await page.route('https://www.paypal.com/sdk/js?*', route => route.fulfill({ contentType: 'application/javascript', body: `window.paypal = { Buttons(options) { return { async render(target) { const b = document.createElement('button'); b.textContent = 'PayPal SDK fixture'; b.onclick = async () => { await options.createOrder(); await options.onApprove({ orderID: 'MOCK-ORDER' }); }; target.append(b); }, async close() {} }; } };` }));
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

test('order transport failure is identified before buyer checkout', async ({ page }) => {
  await page.route('**/api/config', route => route.fulfill({ json: { payments_enabled: true, capture_enabled: false, client_id: 'test-fixture' } }));
  await page.route('https://www.paypal.com/sdk/js?*', route => route.fulfill({ contentType: 'application/javascript', body: `window.paypal = { Buttons(options) { return { async render(target) { const b = document.createElement('button'); b.textContent = 'PayPal SDK fixture'; b.onclick = async () => { try { await options.createOrder(); } catch { options.onError(); } }; target.append(b); }, async close() {} }; } };` }));
  await page.route('**/api/proposals/*/order', route => route.fulfill({ status: 502, json: { detail: 'PayPal sandbox could not be reached. No success was assumed.' } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Find my best fit' }).click();
  await page.getByRole('button', { name: 'Approve $59.00 USD' }).click();
  await page.getByRole('button', { name: 'PayPal SDK fixture' }).click();
  await expect(page.getByRole('status')).toContainText('backend may be waking up');
});

test('Render cold-start response is actionable and does not imply success', async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ status: 503, json: { detail: 'Database is unavailable' } }));
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('backend may be waking up');
  await expect(page.getByRole('button', { name: 'Find my best fit' })).toBeDisabled();
  await expect(page.locator('body')).not.toContainText('Payment completed');
});

test('owned persisted order is explicitly resumed without creating a replacement', async ({ page }) => {
  const existing = {
    id: 'PROPOSAL-1', product: { sku: 'KEY-01', name: 'Studio Keyboard', category: 'keyboard', cents: 5900, currency: 'USD', merchant: 'Guard Demo Store', attributes: ['Quiet'] },
    quantity: 1, total_cents: 5900, budget_cents: 8000, policy: { within_budget: true, approved_merchant: true }, reasoning: 'Verified.', mode: 'hosted AI', state: 'ORDER_CREATED', order_id: '3S88-EXISTING-000W', created_at: '2026-10-17T08:00:00Z', audit: []
  };
  let resumes = 0;
  let creates = 0;
  await page.route('**/api/config', route => route.fulfill({ json: { payments_enabled: true, capture_enabled: false, client_id: 'test-fixture' } }));
  await page.route('**/api/transactions', route => route.fulfill({ json: [existing] }));
  await page.route('**/api/proposals/PROPOSAL-1/resume', route => { resumes++; return route.fulfill({ json: { id: existing.order_id, status: 'CREATED', proposal: existing } }); });
  await page.route('**/api/proposals/PROPOSAL-1/order', route => { creates++; return route.fulfill({ status: 500 }); });
  await page.route('https://www.paypal.com/sdk/js?*', route => route.fulfill({ contentType: 'application/javascript', body: `window.paypal = { Buttons(options) { return { async render(target) { const b = document.createElement('button'); b.textContent = 'Resume existing PayPal order'; b.onclick = () => options.createOrder(); target.append(b); }, async close() {} }; } };` }));
  await page.goto('/');
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(page.getByText('3S88-EXISTING-000W')).toBeVisible();
  await page.getByRole('button', { name: 'Resume Checkout' }).click();
  await expect(page.getByText('Resuming existing Sandbox order')).toBeVisible();
  await expect(page.getByText('3S88-EXISTING-000W', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Resume existing PayPal order' }).click();
  await expect.poll(() => resumes).toBe(2);
  expect(creates).toBe(0);
});
