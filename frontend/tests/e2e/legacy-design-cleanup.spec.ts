import { test, expect } from '@playwright/test';

/**
 * Limpieza del diseño viejo: la paleta crema/oliva y sus alias ya no existen en el tema, quedan solo los tokens
 * de la v4, y las pantallas públicas no piden la foto de Unsplash ni la escena de Spline del login anterior.
 * No necesita backend.
 */

const LEGACY_TOKENS = [
  '--color-cream',
  '--color-sand',
  '--color-moss',
  '--color-loam',
  '--color-sprout',
  '--color-beige',
  '--color-olive',
  '--color-paper',
  '--color-surface',
  '--color-bg-card',
  '--color-bg-hero',
  '--color-accent-light',
  '--color-neutral-warm',
  '--color-danger',
];

const CURRENT_TOKENS: Record<string, string> = {
  '--color-pine': '#00311e',
  '--color-field-700': '#3e7949',
  '--color-sage-50': '#f4f6f4',
  '--color-sage-600': '#5a5f5b',
};

const readTokens = (names: string[]) =>
  names.map((name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim());

test.describe('Limpieza del diseño viejo', () => {
  for (const path of ['/login', '/register', '/forgot-password']) {
    test(`${path} usa solo la paleta actual y no carga recursos del login viejo`, async ({ page }) => {
      const legacyRequests: string[] = [];
      page.on('request', (request) => {
        if (/unsplash\.com|spline\.design/.test(request.url())) legacyRequests.push(request.url());
      });

      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const legacyValues = await page.evaluate(readTokens, LEGACY_TOKENS);
      expect(legacyValues.every((value) => value === '')).toBe(true);

      const currentNames = Object.keys(CURRENT_TOKENS);
      const currentValues = await page.evaluate(readTokens, currentNames);
      expect(currentValues).toEqual(Object.values(CURRENT_TOKENS));

      expect(legacyRequests).toEqual([]);
    });
  }

  // Las páginas del scaffold que devolvían `null` se borraron: ahora responden con el 404 de la app.
  for (const path of ['/profile', '/matches/scaffold-id', '/match-discovery/scaffold-id/recommendations']) {
    test(`${path} ya no es una pantalla en blanco sino la página 404`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(404);
      await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();
    });
  }
});
