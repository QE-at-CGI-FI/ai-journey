import { test, expect } from '@playwright/test';

test.describe('Individual tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Names are anonymized ("Person 1", ...) by default — show real names so
    // the roster can be asserted against by the names these tests enter.
    await page.getByRole('button', { name: 'Anonymized' }).click();
    await page.getByRole('tab', { name: 'Individual' }).click();
  });

  test('adding a person adds them to the roster and selects them for detail tracking', async ({ page }) => {
    await expect(page.getByText('No one tracked yet')).toBeVisible();

    await page.getByPlaceholder('Add a person by name…').fill('Ada Lovelace');
    await page.getByRole('button', { name: '+ Add' }).click();

    const rosterItem = page.locator('.roster__item', { hasText: 'Ada Lovelace' });
    await expect(rosterItem).toBeVisible();
    await expect(rosterItem).toHaveClass(/roster__item--active/);
    await expect(page.getByText(/areas growing for Ada Lovelace/)).toBeVisible();
  });

  test('toggling a growth-area item updates that person\'s roster coverage badge', async ({ page }) => {
    await page.getByPlaceholder('Add a person by name…').fill('Grace Hopper');
    await page.getByRole('button', { name: '+ Add' }).click();

    const rosterItem = page.locator('.roster__item', { hasText: 'Grace Hopper' });
    await expect(rosterItem.locator('.roster__badge')).toHaveText(/^0 \//);

    const detail = page.locator('.individual-detail');
    await detail.locator('.enabler-item', { hasText: 'External imagination' }).getByRole('switch').click();

    await expect(rosterItem.locator('.roster__badge')).toHaveText(/^1 \//);
  });

  test('removing a person clears them from the roster', async ({ page }) => {
    await page.getByPlaceholder('Add a person by name…').fill('Temp Person');
    await page.getByRole('button', { name: '+ Add' }).click();

    const rosterItem = page.locator('.roster__item', { hasText: 'Temp Person' });
    page.once('dialog', (dialog) => dialog.accept());
    await rosterItem.getByRole('button', { name: 'Remove person' }).click();

    await expect(rosterItem).toHaveCount(0);
    await expect(page.getByText('No one tracked yet')).toBeVisible();
  });

  test('dragging a roster row reorders the people list', async ({ page }) => {
    const rosterAdd = page.locator('.roster__add');
    for (const name of ['Alpha', 'Bravo', 'Charlie']) {
      await rosterAdd.getByPlaceholder('Add a person by name…').fill(name);
      await rosterAdd.getByRole('button', { name: '+ Add' }).click();
    }

    const names = page.locator('.roster__name');
    await expect(names).toHaveText(['Alpha', 'Bravo', 'Charlie']);

    const items = page.locator('.roster__item');
    await items.nth(0).dragTo(items.nth(2));

    await expect(names).toHaveText(['Bravo', 'Charlie', 'Alpha']);
  });
});
