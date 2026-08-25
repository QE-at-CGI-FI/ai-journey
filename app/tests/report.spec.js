import { test, expect } from '@playwright/test';

test.describe('Print report', () => {
  async function addPerson(page, name) {
    await page.getByRole('tab', { name: 'Individual' }).click();
    const rosterAdd = page.locator('.roster__add');
    await rosterAdd.getByPlaceholder('Add a person by name…').fill(name);
    await rosterAdd.getByRole('button', { name: '+ Add' }).click();
  }

  test('anonymizes the organization and person names while Anonymized is on', async ({ page }) => {
    await page.goto('/');

    // Reveal real names just long enough to set up identifiable test data.
    await page.getByRole('button', { name: /Anonymized|Show names/ }).click();
    await page.locator('#org-name').fill('Acme Corp');
    await addPerson(page, 'Ada Lovelace');

    // Re-anonymize before printing — this is the state the report should respect.
    await page.getByRole('button', { name: /Anonymized|Show names/ }).click();
    await page.getByRole('button', { name: '🖨 Print report' }).click();

    await expect(page.getByRole('heading', { name: /Client Organization — Journey report/ })).toBeVisible();
    await expect(page.locator('.report__table')).toContainText('Person 1');
    await expect(page.locator('.report__page')).not.toContainText('Acme Corp');
    await expect(page.locator('.report__page')).not.toContainText('Ada Lovelace');
  });

  test('shows real organization and person names when Anonymized is off', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Anonymized|Show names/ }).click();
    await page.locator('#org-name').fill('Acme Corp');
    await addPerson(page, 'Ada Lovelace');

    await page.getByRole('button', { name: '🖨 Print report' }).click();

    await expect(page.getByRole('heading', { name: /Acme Corp — Journey report/ })).toBeVisible();
    await expect(page.locator('.report__table')).toContainText('Ada Lovelace');
  });

  test('back to app closes the report', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '🖨 Print report' }).click();
    await expect(page.locator('.report')).toBeVisible();

    await page.getByRole('button', { name: '← Back to app' }).click();
    await expect(page.locator('.report')).toHaveCount(0);
  });
});
