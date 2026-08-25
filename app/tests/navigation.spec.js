import { test, expect } from '@playwright/test';

test.describe('App shell and navigation', () => {
  test('loads with the Journey tab active by default', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('AI-Native Journey Tracker');
    await expect(page.getByRole('heading', { name: 'AI-Native Journey' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Journey' })).toHaveAttribute('aria-selected', 'true');
  });

  test('switches panels when a tab is clicked', async ({ page }) => {
    await page.goto('/');

    const tabs = [
      { name: 'Organization', heading: 'Organizational foundational enablers' },
      { name: 'Learning culture', heading: 'Learning culture' },
      { name: 'Individual', heading: 'Individual growth journey' },
      { name: 'Badges', heading: 'Badges' },
      { name: 'Value', heading: 'Value' },
      { name: 'Actions', heading: 'Actions' },
    ];

    for (const { name, heading } of tabs) {
      await page.getByRole('tab', { name }).click();
      await expect(page.getByRole('tab', { name })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('heading', { name: new RegExp(heading, 'i') }).first()).toBeVisible();
    }
  });

  test('shows the local-storage footer note', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Saved automatically to this browser's local storage/i)).toBeVisible();
  });
});
