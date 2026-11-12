import { test, expect } from '@playwright/test';

// With names shown, each roster name is an editable text box, which text
// matching can't see — so check the boxes' values, in roster order.
async function expectRosterNames(page, names) {
  const inputs = page.getByTitle('Edit name');
  await expect(inputs).toHaveCount(names.length);
  for (const [i, name] of names.entries()) {
    await expect(inputs.nth(i)).toHaveValue(name);
  }
}

test.describe('Individual tab', () => {
  test.beforeEach(async ({ page }) => {
    // A fresh browser loads the demo organization; seed an empty save so
    // these tests start blank. Only when nothing is saved yet, so a reload
    // inside a test still keeps what that test changed.
    await page.addInitScript(() => {
      if (!localStorage.getItem('cgi-ai-journey-tracker')) localStorage.setItem('cgi-ai-journey-tracker', '{}');
    });
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

    await expectRosterNames(page, ['Ada Lovelace']);
    await expect(page.locator('.roster__item').first()).toHaveClass(/roster__item--active/);
    await expect(page.getByText(/areas growing for Ada Lovelace/)).toBeVisible();
  });

  test('shows a star next to people who have done the experience-intake assessment', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem(
        'cgi-ai-journey-tracker',
        JSON.stringify({
          individuals: [
            { id: 'ind-a', name: 'Assessed', intakeAssessed: true },
            { id: 'ind-b', name: 'Not assessed' },
          ],
        }),
      );
    });
    await page.reload();
    await page.getByRole('button', { name: 'Anonymized' }).click();
    await page.getByRole('tab', { name: 'Individual' }).click();

    const items = page.locator('.roster__item');
    await expect(items.nth(0).getByLabel('Experience-intake assessment done')).toBeVisible();
    await expect(items.nth(1).getByLabel('Experience-intake assessment done')).toHaveCount(0);
  });

  test('toggling a growth-area item updates that person\'s roster coverage badge', async ({ page }) => {
    await page.getByPlaceholder('Add a person by name…').fill('Grace Hopper');
    await page.getByRole('button', { name: '+ Add' }).click();

    await expectRosterNames(page, ['Grace Hopper']);
    const rosterItem = page.locator('.roster__item').first();
    await expect(rosterItem.locator('.roster__badge')).toHaveText(/^0 \//);

    const detail = page.locator('.individual-detail');
    await detail.locator('.enabler-item', { hasText: 'External imagination' }).getByRole('switch').click();

    await expect(rosterItem.locator('.roster__badge')).toHaveText(/^1 \//);
  });

  test('removing a person clears them from the roster', async ({ page }) => {
    await page.getByPlaceholder('Add a person by name…').fill('Temp Person');
    await page.getByRole('button', { name: '+ Add' }).click();

    await expectRosterNames(page, ['Temp Person']);
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('.roster__item').first().getByRole('button', { name: 'Remove person' }).click();

    await expect(page.locator('.roster__item')).toHaveCount(0);
    await expect(page.getByText('No one tracked yet')).toBeVisible();
  });

  test('dragging a roster row reorders the people list', async ({ page }) => {
    // In the default 720px-high window the last row sits at the bottom edge,
    // and the page scrolls mid-drag so the drop lands on the wrong row.
    await page.setViewportSize({ width: 1280, height: 1200 });
    const rosterAdd = page.locator('.roster__add');
    for (const name of ['Alpha', 'Bravo', 'Charlie']) {
      await rosterAdd.getByPlaceholder('Add a person by name…').fill(name);
      await rosterAdd.getByRole('button', { name: '+ Add' }).click();
    }

    await expectRosterNames(page, ['Alpha', 'Bravo', 'Charlie']);

    const items = page.locator('.roster__item');
    // Drag by the handle: the middle of a row is the name text box, where a
    // drag selects text instead of moving the row.
    await items.nth(0).locator('.roster__handle').dragTo(items.nth(2).locator('.roster__handle'));

    await expectRosterNames(page, ['Bravo', 'Charlie', 'Alpha']);
  });
});
