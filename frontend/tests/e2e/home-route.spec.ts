import { test, expect, type Page } from '@playwright/test';

/**
 * Entrada a la app después del login (`/auth/continue`, también el logo): con un campo en uso va directo al tablero
 * del campo; sin campos, el productor va a Buscar y el profesional a su Panel.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario de prueba ya registrado, y
 * la API levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
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

test.describe('Entrada a la app según los campos del usuario', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test('entra al tablero de su campo o, sin campos, a Buscar o al Panel', async ({ page }) => {
    await signIn(page);

    // Qué campos en uso tiene el usuario, vistos en la lista de Campos.
    await page.goto('/farms');
    const farmLinks = page
      .getByRole('main')
      .getByRole('list')
      .getByRole('link')
      .filter({ hasNotText: 'Archivado' });
    const hasFarm = (await farmLinks.count()) > 0;
    const isProducer = await page
      .getByRole('button', { name: /menú de la cuenta/ })
      .getByText('Productor', { exact: true })
      .isVisible();

    await page.goto('/auth/continue');

    if (hasFarm) {
      await expect(page).toHaveURL(/\/farms\/[^/?]+$/);
      await expect(
        page.getByRole('heading', { level: 1, name: /^(Buenos días|Buenas tardes|Buenas noches)/ })
      ).toBeVisible();
    } else if (isProducer) {
      await expect(page).toHaveURL(/\/match-discovery$/);
    } else {
      await expect(page).toHaveURL(/\/dashboard$/);
    }
  });

  test('el logo lleva al mismo lugar que el login', async ({ page }) => {
    await signIn(page);
    await page.goto('/auth/continue');
    const home = new URL(page.url()).pathname;

    await page.goto('/matches');
    await page
      .getByRole('complementary', { name: 'Barra lateral' })
      .getByRole('link', { name: 'AgroNexo — Inicio' })
      .click();
    await expect.poll(() => new URL(page.url()).pathname).toBe(home);
  });
});
