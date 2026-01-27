import { test, expect } from '@playwright/test';

test('homepage has title and search bar', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Sprawdź tytuł strony (może być null, jeśli nie ustawiony, ale sprawdźmy czy nie ma błędu)
    await expect(page).toHaveTitle(/LolStats|Vite/i);

    // Sprawdź czy jest wyszukiwarka
    const searchInput = page.locator('input[placeholder*="Nick#TAG"]');
    await expect(searchInput).toBeVisible();
});
