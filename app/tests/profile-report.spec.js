import { test, expect } from '@playwright/test';

test.describe('Print individual profile', () => {
  async function addPerson(page, name) {
    await page.getByRole('tab', { name: 'Individual' }).click();
    const rosterAdd = page.locator('.roster__add');
    await rosterAdd.getByPlaceholder('Add a person by name…').fill(name);
    await rosterAdd.getByRole('button', { name: '+ Add' }).click();
  }

  test('prints the selected individual\'s acquired/not-yet-acquired checklist', async ({ page }) => {
    await page.goto('/');
    await addPerson(page, 'Ada Lovelace');

    // Newly added person is auto-selected; toggle one item on before printing.
    await page.locator('.enabler-item').first().getByRole('switch').click();

    await page.getByRole('button', { name: '🖨 Print profile' }).click();

    await expect(page.locator('.profile-report')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible();
    await expect(page.locator('.profile-report__page')).toContainText('Acquired (1)');
  });

  test('switching the roster selection changes who gets printed', async ({ page }) => {
    await page.goto('/');
    await addPerson(page, 'Ada Lovelace');
    await addPerson(page, 'Grace Hopper');

    // Second person added is auto-selected.
    await page.getByRole('button', { name: '🖨 Print profile' }).click();
    await expect(page.getByRole('heading', { name: 'Grace Hopper' })).toBeVisible();
    await page.getByRole('button', { name: '← Back to app' }).click();

    await page.locator('.roster__item', { hasText: 'Ada Lovelace' }).click();
    await page.getByRole('button', { name: '🖨 Print profile' }).click();
    await expect(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible();
  });

  test('back to app closes the profile report', async ({ page }) => {
    await page.goto('/');
    await addPerson(page, 'Ada Lovelace');

    await page.getByRole('button', { name: '🖨 Print profile' }).click();
    await expect(page.locator('.profile-report')).toBeVisible();

    await page.getByRole('button', { name: '← Back to app' }).click();
    await expect(page.locator('.profile-report')).toHaveCount(0);
  });
});
