import { test, expect } from '@playwright/test';

/**
 * Barra de pasos de "Crear cuenta": un `Progress` thin de Cashmere por paso (demo "Progress Sizes"). El paso actual
 * y los anteriores se pintan con el verde de acción (field-700); los que faltan quedan en el carril claro. No necesita
 * backend: el primer paso (cuenta) se ve sin sesión.
 */

const GREEN = 'rgb(62, 121, 73)'; // field-700 (--primary)

test.describe('Barra de pasos del registro', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('muestra un Progress thin por paso con el actual pintado de verde', async ({ page }) => {
    await page.goto('/onboarding');

    const progress = page.getByRole('progressbar', { name: /^Paso 1 de \d+$/ });
    await expect(progress).toBeVisible();
    const total = Number(await progress.getAttribute('aria-valuemax'));
    expect(total).toBeGreaterThan(1);
    await expect(progress).toHaveAttribute('aria-valuenow', '1');

    const steps = progress.locator('[data-slot="progress"]');
    await expect(steps).toHaveCount(total);

    // Thin: carril de 4px.
    const track = steps.first().locator('[data-slot="progress-track"]');
    expect(await track.evaluate((el) => el.getBoundingClientRect().height)).toBe(4);

    // El paso actual está lleno y en verde; el siguiente, vacío.
    const current = steps.first().locator('[data-slot="progress-indicator"]');
    await expect
      .poll(() => current.evaluate((el) => getComputedStyle(el).backgroundColor))
      .toBe(GREEN);
    await expect
      .poll(() =>
        current.evaluate(
          (el) => el.getBoundingClientRect().width / el.parentElement!.getBoundingClientRect().width
        )
      )
      .toBeCloseTo(1, 1);

    const next = steps.nth(1).locator('[data-slot="progress-indicator"]');
    expect(await next.evaluate((el) => el.getBoundingClientRect().width)).toBe(0);

    // Las barras de cada paso no se anuncian por separado: el lector lee solo "Paso 1 de N".
    await expect(steps.first()).toHaveAttribute('aria-hidden', 'true');
  });
});
