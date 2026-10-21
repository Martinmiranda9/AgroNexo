import { test, expect, type Page } from '@playwright/test';

/**
 * Nuevo lote en pantalla completa: las hectáreas se cargan siempre a mano y el dibujo en el mapa satelital es opcional,
 * solo para ubicarlo. Con coordenadas, el mapa va al punto.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un productor de prueba (o de un
 * agrónomo del equipo) que tenga al menos un campo, y la API levantada con la migración de lotes en el mapa. Sin el
 * token, los tests se saltean.
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

async function openNewLot(page: Page) {
  await page.goto('/farms');
  const farmLink = page
    .getByRole('main')
    .getByRole('link')
    .filter({ hasNotText: /^Campos$/ })
    .first();
  await farmLink.click();
  await expect(page).toHaveURL(/\/farms\/[^/]+$/);

  await page.getByRole('button', { name: 'Nuevo lote' }).click();
  await expect(page.getByRole('heading', { name: 'Nuevo lote' })).toBeVisible();
}

test.describe('Nuevo lote dibujado en el mapa', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('se abre en pantalla completa con el mapa grande al costado', async ({ page }) => {
    await openNewLot(page);
    const map = page.getByRole('application', { name: 'Mapa para dibujar el lote' });
    await expect(map).toBeVisible();

    const viewport = page.viewportSize()!;
    const box = (await map.boundingBox())!;
    expect(box.width).toBeGreaterThan(viewport.width * 0.5);
    expect(box.height).toBeGreaterThan(viewport.height * 0.5);
  });

  test('con coordenadas el mapa va al punto y avisa si no las entiende', async ({ page }) => {
    await openNewLot(page);
    const coordinates = page.getByLabel('Ir a unas coordenadas');

    await coordinates.fill('Pergamino');
    await page.getByRole('button', { name: 'Ir al punto' }).click();
    await expect(page.getByText('No entendimos las coordenadas.', { exact: false })).toBeVisible();

    await coordinates.fill('-33.8812, -60.5934');
    await coordinates.press('Enter');
    await expect(page.getByText('No entendimos las coordenadas.', { exact: false })).toBeHidden();
    // Enter va al punto, no envía el formulario.
    await expect(page.getByRole('heading', { name: 'Nuevo lote' })).toBeVisible();
  });

  test('pide las hectáreas y no deja guardar un dibujo a medias', async ({ page }) => {
    await openNewLot(page);
    await expect(page.getByText('Sin dibujar: podés guardarlo igual.')).toBeVisible();

    await page.getByLabel('Nombre del lote').fill('Lote sin hectáreas');
    await page.getByRole('button', { name: 'Crear lote' }).click();
    await expect(page.getByText('Cargá las hectáreas del lote.')).toBeVisible();

    const map = page.getByRole('application', { name: 'Mapa para dibujar el lote' });
    const box = (await map.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.getByText('1 esquina de al menos 3')).toBeVisible();
    await page.getByLabel('Hectáreas').fill('10');
    await page.getByRole('button', { name: 'Crear lote' }).click();
    await expect(page.getByText(/Terminá el dibujo/)).toBeVisible();
  });

  test('con 4 esquinas guarda el lote con las hectáreas declaradas y su ubicación', async ({
    page,
  }) => {
    await openNewLot(page);
    const map = page.getByRole('application', { name: 'Mapa para dibujar el lote' });
    await expect(map).toBeVisible();

    const box = (await map.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    for (const [dx, dy] of [
      [-20, -20],
      [20, -20],
      [20, 20],
      [-20, 20],
    ] as const) {
      await page.mouse.click(cx + dx, cy + dy);
    }
    await expect(page.getByText('Dibujado · 4 esquinas')).toBeVisible();

    await page.getByRole('button', { name: 'Deshacer esquina' }).click();
    await expect(page.getByText('Dibujado · 3 esquinas')).toBeVisible();
    await page.mouse.click(cx - 20, cy + 20);
    await expect(page.getByText('Dibujado · 4 esquinas')).toBeVisible();

    const name = `Lote dibujado ${Date.now()}`;
    await page.getByLabel('Nombre del lote').fill(name);
    await page.getByLabel('Hectáreas').fill('12');
    await page.getByRole('button', { name: 'Crear lote' }).click();

    // El dibujo es solo referencia: se guarda aunque quede afuera del perímetro o encima de otro lote.
    await expect(page.getByText(`Creaste ${name}`)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Nuevo lote' })).toBeHidden();
    await expect(page.getByRole('main').getByText(name).first()).toBeVisible();
  });

  test('sin dibujar, el lote se guarda solo con sus hectáreas', async ({ page }) => {
    await openNewLot(page);

    const name = `Lote a mano ${Date.now()}`;
    await page.getByLabel('Nombre del lote').fill(name);
    await page.getByLabel('Hectáreas').fill('1');
    await page.getByRole('button', { name: 'Crear lote' }).click();

    await expect(page.getByText(`Creaste ${name}`)).toBeVisible({ timeout: 15_000 });
  });
});
