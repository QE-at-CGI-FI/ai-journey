import { test, expect } from '@playwright/test';

test.describe('Print summary', () => {
  async function addPerson(page, name) {
    await page.getByRole('tab', { name: 'Individual' }).click();
    const rosterAdd = page.locator('.roster__add');
    await rosterAdd.getByPlaceholder('Add a person by name…').fill(name);
    await rosterAdd.getByRole('button', { name: '+ Add' }).click();
  }

  test('shows high-level checklists for each step without a people list', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '🖨 Print summary' }).click();

    await expect(page.getByRole('heading', { name: /— Journey summary/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Foundational enablers', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Learning culture', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Individual experiences', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Benefits showcase', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Badges', exact: false })).toBeVisible();
    await expect(page.locator('.summary__page')).not.toContainText('Person 1');
    await expect(page.locator('.summary')).toHaveCount(1);
    await expect(page.locator('.report')).toHaveCount(0);
  });

  test('anonymizes the organization name while Anonymized is on', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Anonymized|Show names/ }).click();
    await page.locator('#org-name').fill('Acme Corp');
    await addPerson(page, 'Ada Lovelace');

    await page.getByRole('button', { name: /Anonymized|Show names/ }).click();
    await page.getByRole('button', { name: '🖨 Print summary' }).click();

    await expect(page.getByRole('heading', { name: /Client Organization — Journey summary/ })).toBeVisible();
    await expect(page.locator('.summary__page')).not.toContainText('Acme Corp');
    await expect(page.locator('.summary__page')).not.toContainText('Ada Lovelace');
  });

  test('back to app closes the summary', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '🖨 Print summary' }).click();
    await expect(page.locator('.summary')).toBeVisible();

    await page.getByRole('button', { name: '← Back to app' }).click();
    await expect(page.locator('.summary')).toHaveCount(0);
  });
});
