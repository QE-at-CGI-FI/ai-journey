import { test, expect } from '@playwright/test';

test.describe('Actions tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Actions' }).click();
  });

  test('adding an action shows it in the list and updates the count', async ({ page }) => {
    await expect(page.getByText('No actions planned yet')).toBeVisible();

    await page.getByRole('button', { name: '+ Add action' }).click();
    await page.getByPlaceholder('Action title').fill('Roll out sandbox trust training');
    await page.getByPlaceholder('What needs to happen…').fill('Run a workshop for all teams.');
    await page.getByPlaceholder(/Timeline/).fill('Q3 2026');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Actions (1)' })).toBeVisible();
    const card = page.locator('.action-card', { hasText: 'Roll out sandbox trust training' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('Run a workshop for all teams.');
    await expect(card).toContainText('Q3 2026');
  });

  test('removing an action takes it out of the list', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add action' }).click();
    await page.getByPlaceholder('Action title').fill('Temporary action');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    const card = page.locator('.action-card', { hasText: 'Temporary action' });
    await card.getByRole('button', { name: 'Remove action' }).click();

    await expect(card).toHaveCount(0);
    await expect(page.getByText('No actions planned yet')).toBeVisible();
  });
});
