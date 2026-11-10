import { test, expect } from '@playwright/test';

test.describe('Data controls', () => {
  test('anonymize toggle hides/shows the organization name field', async ({ page }) => {
    await page.goto('/');

    const orgInput = page.locator('#org-name');
    const toggleBtn = page.getByRole('button', { name: /Anonymized|Show names/ });

    // Anonymized by default: field is disabled and shows the placeholder org name.
    await expect(toggleBtn).toHaveText(/Anonymized/);
    await expect(orgInput).toBeDisabled();
    await expect(orgInput).toHaveValue('Client Organization');

    await toggleBtn.click();

    await expect(toggleBtn).toHaveText(/Show names/);
    await expect(orgInput).toBeEnabled();
  });

  test('export downloads a JSON backup file', async ({ page }) => {
    await page.goto('/');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: '↓ Export' }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^ai-journey-tracker-.*\.json$/);
  });

  test('clear data does nothing when the confirmation is dismissed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Actions' }).click();
    await page.getByRole('button', { name: '+ Add action' }).click();
    await page.getByPlaceholder('Action title').fill('Keep me around');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Clear data' }).click();

    await expect(page.locator('.action-card', { hasText: 'Keep me around' })).toBeVisible();
  });

  test('clear data wipes tracked data when the confirmation is accepted', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Actions' }).click();
    await page.getByRole('button', { name: '+ Add action' }).click();
    await page.getByPlaceholder('Action title').fill('Remove me');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Clear data' }).click();

    await expect(page.getByText('No actions planned yet')).toBeVisible();
  });

  test('import restores a previously exported backup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Actions' }).click();
    await page.getByRole('button', { name: '+ Add action' }).click();
    await page.getByPlaceholder('Action title').fill('Round-trip action');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: '↓ Export' }).click(),
    ]);
    // Read the download straight into memory instead of going through
    // download.path() — the on-disk path isn't always available/stable
    // across environments and was the source of an intermittent failure.
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const backup = Buffer.concat(chunks);

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Clear data' }).click();
    await expect(page.getByText('No actions planned yet')).toBeVisible();

    // Set the file directly on the hidden input rather than clicking the
    // "Import" button first — clicking it would open a native OS file
    // picker that Playwright can't drive.
    await page.setInputFiles('input[type="file"]', {
      name: download.suggestedFilename(),
      mimeType: 'application/json',
      buffer: backup,
    });

    await expect(page.locator('.action-card', { hasText: 'Round-trip action' })).toBeVisible();
  });

  test('import maps a pre-v6 developer role and its custom items to builder', async ({ page }) => {
    await page.goto('/');
    const legacy = {
      version: 5,
      individuals: [
        {
          id: 'ind-legacy',
          name: 'Legacy Person',
          roleFlags: { knowledgeWorker: false, developer: true },
          values: { 'legacy-custom': { on: true, details: '' } },
          customItems: { developer: [{ id: 'legacy-custom', label: 'Legacy builder item' }] },
        },
      ],
    };
    await page.setInputFiles('input[type="file"]', {
      name: 'ai-journey-tracker-legacy.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(legacy)),
    });

    await page.getByRole('tab', { name: 'Individual' }).click();
    await expect(page.getByRole('button', { name: 'Builder', exact: true })).toHaveClass(/role-chip--active/);
    await expect(page.getByRole('heading', { name: 'Builder role' })).toBeVisible();
    await expect(page.getByText('Legacy builder item')).toBeVisible();
  });
});
