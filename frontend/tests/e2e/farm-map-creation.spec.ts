import { test, expect, type Page } from '@playwright/test';

/**
 * "Nuevo campo" en pantalla completa: los datos a la izquierda y el mapa grande a la derecha. Con coordenadas el mapa
 * va al punto; el perímetro es opcional y solo ubica el campo (las hectáreas se cargan a mano).
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un productor de prueba, y la API
 * levantada. Crea un campo con nombre único por corrida. Sin el token, los tests se saltean.
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

async function openNewFarm(page: Page) {
  await page.goto('/farms');
  await page
    .getByRole('button', { name: /Nuevo campo|Crear campo/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: 'Nuevo campo' })).toBeVisible();
}

test.describe('Nuevo campo con mapa', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('se abre en pantalla completa con el mapa del perímetro', async ({ page }) => {
    await openNewFarm(page);

    const map = page.getByRole('application', { name: 'Mapa para dibujar el perímetro del campo' });
    await expect(map).toBeVisible();
    const box = (await map.boundingBox())!;
    expect(box.width).toBeGreaterThan(page.viewportSize()!.width * 0.5);
    await expect(page.getByLabel('Hectáreas (opcional)')).toBeVisible();
  });

  test('con el perímetro dibujado se crea el campo con las hectáreas declaradas', async ({
    page,
  }) => {
    await openNewFarm(page);

    const coordinates = page.getByLabel('Ubicación del campo (opcional)');
    await coordinates.fill('-33.8812, -60.5934');
    await page.getByRole('button', { name: 'Ir al punto' }).click();

    const map = page.getByRole('application', { name: 'Mapa para dibujar el perímetro del campo' });
    const box = (await map.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    for (const [dx, dy] of [
      [-60, -40],
      [60, -40],
      [60, 40],
      [-60, 40],
    ] as const) {
      await page.mouse.click(cx + dx, cy + dy);
    }

    await expect(page.getByText('Dibujado · 4 esquinas')).toBeVisible();
    // El perímetro solo ubica el campo: las hectáreas se siguen cargando a mano.
    await expect(page.getByLabel('Hectáreas (opcional)')).toBeVisible();

    const name = `Campo con mapa ${Date.now()}`;
    await page.getByLabel('Nombre del campo').fill(name);
    await page.getByLabel('Hectáreas (opcional)').fill('350');
    await page.getByRole('button', { name: 'Crear campo' }).click();

    await expect(page.getByText(`Creaste ${name}`)).toBeVisible({ timeout: 15_000 });
  });
});
