import { test, expect, type Page } from '@playwright/test';

/**
 * "Ver lote" en la card de superficie del tablero: abre un popup grande con la ubicación del lote en el mapa y sus datos
 * (superficie declarada, cultivo, última labor y quién lo ubicó).
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario de prueba con un campo que
 * tenga al menos un lote, y la API levantada. Sin el token, los tests se saltean.
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;

async function signIn(page: Page) {
  await page.context().addCookies([
    {
      name: 'agronexo_session',
      value: SESSION_TOKEN!,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    },
  ]);
}

async function openFirstFarm(page: Page) {
  await page.goto('/farms');
  await page
    .getByRole('main')
    .getByRole('link')
    .filter({ hasNotText: /^Campos$/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/farms\/[^/]+$/);
}

test.describe('Ver lote desde el tablero', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('cada lote tiene "Ver lote" y abre un popup grande con el mapa y los datos', async ({
    page,
  }) => {
    await openFirstFarm(page);

    const viewButton = page.getByRole('button', { name: /^Ver lote / }).first();
    await expect(viewButton).toBeVisible();
    const lotName = ((await viewButton.getAttribute('aria-label')) ?? '').replace('Ver lote ', '');
    await viewButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: lotName })).toBeVisible();
    await expect(dialog.getByRole('application', { name: `Mapa de ${lotName}` })).toBeVisible();
    for (const label of [
      'Superficie declarada',
      'Cultivo de la campaña',
      'Última labor',
      'Ubicación en el mapa',
    ]) {
      await expect(dialog.getByText(label, { exact: true })).toBeVisible();
    }

    // Grande: más de la mitad del ancho de la pantalla.
    const box = (await dialog.boundingBox())!;
    expect(box.width).toBeGreaterThan(page.viewportSize()!.width * 0.5);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
