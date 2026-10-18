import { test, expect, type Page } from '@playwright/test';

/**
 * Tarjeta de solicitud de /matches armada con la Card de Cashmere: avatar con iniciales, nombre y bajada a la
 * izquierda, estado (Badge) arriba a la derecha, texto de la solicitud, etiquetas y, si corresponde, el contacto
 * debajo de una línea.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario registrado que tenga al
 * menos una solicitud, y la API levantada. Sin el token, los tests se saltean.
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;

async function signIn(page: Page) {
  await page
    .context()
    .addCookies([
      {
        name: 'agronexo_session',
        value: SESSION_TOKEN!,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
    ]);
}

test.describe('Solicitudes con la Card de Cashmere', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto('/matches');
  });

  test('cada solicitud mantiene nombre, estado, descripción y etiquetas dentro de una Card', async ({
    page,
  }) => {
    const card = page.locator('[data-slot="card"]').first();
    await expect(card).toBeVisible();

    const title = card.locator('[data-slot="card-title"]');
    const status = card.locator('[data-slot="card-action"]');
    await expect(title).toBeVisible();
    await expect(status).toHaveText(/Pendiente|Aceptado|Rechazado|Cancelado|Completado/);
    await expect(card.getByRole('list', { name: 'Datos del pedido' })).toBeVisible();

    // El estado queda a la derecha del nombre y a la misma altura.
    const [t, s] = [(await title.boundingBox())!, (await status.boundingBox())!];
    expect(s.x).toBeGreaterThan(t.x + t.width - 1);
    expect(Math.abs(s.y - t.y)).toBeLessThan(16);

    // Título 16px semibold (el de CardTitle) y bajada 14px, en Inter.
    expect(await title.evaluate((el) => getComputedStyle(el).fontSize)).toBe('16px');
    expect(await title.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('600');
    expect(await title.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/inter/i);
  });

  test('la tarjeta aceptada muestra el contacto debajo de una línea separadora', async ({
    page,
  }) => {
    const accepted = page.locator('[data-slot="card"]').filter({ hasText: 'Aceptado' }).first();
    test.skip(
      (await accepted.count()) === 0,
      'La cuenta de prueba no tiene una solicitud aceptada'
    );

    const footer = accepted.locator('[data-slot="card-footer"]');
    await expect(footer.getByText(/^Contacto de /)).toBeVisible();
    expect(await footer.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('1px');
  });
});
