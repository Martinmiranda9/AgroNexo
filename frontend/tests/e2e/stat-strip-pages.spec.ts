import { test, expect, type Page } from '@playwright/test';

/**
 * Tira de métricas (la fila de cifras de la referencia "Uxerflow") y encabezado de sección de Cashmere en las
 * pantallas que estaban vacías arriba: Campos, Solicitudes y el panel del profesional.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario de prueba ya registrado
 * (productor o profesional), y la API levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
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

test.describe('Tira de métricas y encabezados de sección', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('Campos resume los campos en cuatro cifras, en una sola card', async ({ page }) => {
    await page.goto('/farms');
    await expect(page.getByRole('heading', { level: 1, name: 'Campos' })).toBeVisible();

    const strip = page.getByLabel('Resumen de los campos');
    test.skip(!(await strip.isVisible()), 'El usuario de prueba no tiene campos');

    for (const label of ['Campos en uso', 'Superficie', 'Profesionales', 'Con equipo']) {
      await expect(strip.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(strip.getByText('ha', { exact: true })).toBeVisible();

    // Las cuatro celdas comparten la misma fila en escritorio.
    const cells = strip.locator('[data-slot="stat-strip-item"]');
    await expect(cells).toHaveCount(4);
    const tops = await cells.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(new Set(tops).size).toBe(1);
  });

  test('el ícono de información explica qué cuenta cada cifra', async ({ page }) => {
    await page.goto('/matches');
    const strip = page.getByLabel('Resumen de solicitudes');
    test.skip(!(await strip.isVisible()), 'El usuario de prueba no tiene solicitudes');

    await strip.getByRole('button', { name: 'Qué es pendientes' }).hover();
    await expect(page.getByRole('tooltip')).toContainText(/Esperan/);
  });

  test('Solicitudes cuenta pendientes, aceptadas y las que no siguieron', async ({ page }) => {
    await page.goto('/matches');
    await expect(
      page.getByRole('heading', { level: 1, name: /^(Mis solicitudes|Solicitudes de match)$/ })
    ).toBeVisible();

    const strip = page.getByLabel('Resumen de solicitudes');
    test.skip(!(await strip.isVisible()), 'El usuario de prueba no tiene solicitudes');

    for (const label of ['Pendientes', 'Aceptadas', 'Sin seguir']) {
      await expect(strip.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(strip.getByText(/^(Enviadas|Recibidas)$/)).toBeVisible();
  });

  test('el panel del profesional saluda y muestra sus solicitudes pendientes', async ({ page }) => {
    await page.goto('/dashboard');
    test.skip(!/\/dashboard$/.test(page.url()), 'El usuario de prueba es productor (va a Buscar)');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /^(Buenos días|Buenas tardes|Buenas noches|Panel)/,
      })
    ).toBeVisible();

    const strip = page.getByLabel('Resumen de solicitudes');
    if (await strip.isVisible()) {
      await expect(strip.getByText('Recibidas', { exact: true })).toBeVisible();
      const pending = page.getByRole('region', { name: 'Esperando tu respuesta' });
      await expect(pending.getByRole('heading', { name: 'Esperando tu respuesta' })).toBeVisible();
      await pending.getByRole('link', { name: 'Ver todas' }).click();
      await expect(page).toHaveURL(/\/matches$/);
    } else {
      await expect(page.getByText('Todavía no recibiste solicitudes')).toBeVisible();
    }
  });
});
