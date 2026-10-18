import { test, expect } from '@playwright/test';

/**
 * Avisos "Alert with Icons": aparecen arriba a la derecha, duran 4 segundos y se borran solos. Verde con ícono de
 * check cuando algo sale bien, negro con ícono de info cuando solo se informa y rojo con ícono de error cuando falla.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un productor ya registrado y la API
 * levantada. El flujo es el del productor: crear un campo desde /farms.
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;

test.describe('Avisos del productor', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'agronexo_session',
        value: SESSION_TOKEN!,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
    ]);
  });

  test('crear un campo muestra un aviso verde arriba a la derecha que desaparece a los 4 segundos', async ({
    page,
  }) => {
    const farmName = `Campo de prueba ${Date.now()}`;
    await page.goto('/farms');
    await page
      .getByRole('button', { name: /Nuevo campo|Crear mi primer campo/ })
      .first()
      .click();
    await page.getByLabel('Nombre del campo').fill(farmName);

    const creation = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/farms')
    );
    await page.getByRole('button', { name: 'Crear campo' }).click();
    expect((await creation).status()).toBeLessThan(300);

    const notice = page.locator('li[data-state]').filter({ hasText: `Creaste ${farmName}` });
    await expect(notice).toBeVisible();

    // Verde y con ícono.
    const color = await notice.evaluate((el) => getComputedStyle(el).color);
    const [, r, g, b] = color.match(/(\d+),\s*(\d+),\s*(\d+)/)!.map(Number);
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
    await expect(notice.locator('svg').first()).toBeVisible();

    // Arriba a la derecha.
    const box = (await notice.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.y).toBeLessThan(120);
    expect(viewport.width - (box.x + box.width)).toBeLessThan(40);

    // Dura 4 segundos y se borra solo.
    await page.waitForTimeout(3000);
    await expect(notice).toBeVisible();
    await expect(notice).toBeHidden({ timeout: 3000 });
    await expect(notice).toHaveCount(0);
  });
});
