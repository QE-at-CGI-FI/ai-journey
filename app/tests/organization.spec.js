import { test, expect } from '@playwright/test';

test.describe('Organization tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Organization' }).click();
  });

  test('toggling an enabler flips its status pill and updates group progress', async ({ page }) => {
    const group = page.locator('.enabler-group', { hasText: 'Sandbox trust' });
    const item = group.locator('.enabler-item', { hasText: 'Sandbox trust through skill' });

    await expect(item.getByText('Not yet')).toBeVisible();
    await expect(group.locator('.progress')).toHaveText('0 / 3 enabled');

    await item.getByRole('switch').click();

    await expect(item.getByText('Enabled')).toBeVisible();
    await expect(item.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await expect(group.locator('.progress')).toHaveText('1 / 3 enabled');
  });

  test('documenting details for an enabler is saved as typed', async ({ page }) => {
    const item = page.locator('.enabler-item', { hasText: 'Sandbox trust through skill' });
    await item.locator('textarea').fill('Owned by the platform team, rolled out org-wide.');
    await expect(item.locator('textarea')).toHaveValue('Owned by the platform team, rolled out org-wide.');
  });

  test('adding and removing a custom enabler updates the group list and progress', async ({ page }) => {
    const group = page.locator('.enabler-group', { hasText: 'Sandbox trust' });

    await group.getByPlaceholder(/Add a custom item/).fill('Custom enabler for this test');
    await group.getByRole('button', { name: '+ Add' }).click();

    const customItem = group.locator('.enabler-item', { hasText: 'Custom enabler for this test' });
    await expect(customItem).toBeVisible();
    await expect(group.locator('.progress')).toHaveText('0 / 4 enabled');

    await customItem.getByRole('button', { name: 'Remove custom item' }).click();
    await expect(customItem).toHaveCount(0);
    await expect(group.locator('.progress')).toHaveText('0 / 3 enabled');
  });

  test('enabler state persists across a page reload (local storage)', async ({ page }) => {
    const item = page.locator('.enabler-item', { hasText: 'Sandbox trust through skill' });
    await item.getByRole('switch').click();
    await expect(item.getByText('Enabled')).toBeVisible();

    await page.reload();
    await page.getByRole('tab', { name: 'Organization' }).click();

    const reloadedItem = page.locator('.enabler-item', { hasText: 'Sandbox trust through skill' });
    await expect(reloadedItem.getByText('Enabled')).toBeVisible();
  });
});
