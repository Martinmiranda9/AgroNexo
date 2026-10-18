import { test, expect } from '@playwright/test';

/**
 * Tipografía de toda la app: Inter (la de Cashmere), variable y con itálica real. Las cifras en `font-mono` son la
 * única excepción (Geist Mono). No necesita sesión ni backend: se mira en las pantallas públicas.
 */

test.describe('Tipografía Inter', () => {
  test('el cuerpo y los títulos del login usan Inter', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const bodyFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(bodyFamily).toMatch(/inter/i);
    expect(bodyFamily).not.toMatch(/geist/i);

    const headingFamily = await page
      .getByRole('heading', { level: 1 })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(headingFamily).toMatch(/inter/i);

    const buttonFamily = await page
      .getByRole('button', { name: 'Iniciar sesión' })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(buttonFamily).toMatch(/inter/i);
  });

  test('la fuente Inter se carga de verdad en el navegador', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.fonts.check('16px Inter') &&
            [...document.fonts].some((f) => f.family === 'Inter' && f.status === 'loaded')
        )
      )
      .toBe(true);
  });

  test('la tipografía es la misma en el registro', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: 'Creá tu cuenta' })).toBeVisible();
    const family = await page
      .getByRole('heading', { name: 'Creá tu cuenta' })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family).toMatch(/inter/i);
  });
});
