import { test, expect, type Locator } from '@playwright/test';

/**
 * Paso "¿Cuál es tu rol?" del registro: cada ícono va en una baldosa cuadrada con borde (no un círculo), el título
 * es más grande que la bajada, el productor queda en una fila a lo largo y los cuatro profesionales apilan ícono,
 * título y bajada, con el control arriba a la derecha.
 *
 * Con Firebase configurado el paso de rol solo aparece con sesión y sin perfil completo, así que el test necesita
 * en `E2E_SESSION_TOKEN` un ID token de Firebase de una cuenta de prueba sin registrar (y la API en :5000).
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;

const PROFESSIONALS = ['Ingeniero agrónomo', 'Contador', 'Abogado', 'Inversionista'];

const box = async (locator: Locator) => {
  const rect = await locator.boundingBox();
  expect(rect).not.toBeNull();
  return rect!;
};

const fontSize = (locator: Locator) => locator.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

test.describe('Tarjetas de rol del registro', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.skip(!SESSION_TOKEN, 'Falta E2E_SESSION_TOKEN: el paso de rol requiere una sesión de Firebase sin perfil');

  test.beforeEach(async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'agronexo_session', value: SESSION_TOKEN!, url: baseURL! }]);
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: '¿Cuál es tu rol?' })).toBeVisible();
  });

  test('cada ícono va en una baldosa cuadrada y el título se lee más grande que la bajada', async ({ page }) => {
    for (const name of ['Productor', ...PROFESSIONALS]) {
      const card = page.locator('label', { has: page.getByRole('radio', { name: new RegExp(name) }) });
      const tile = card.locator('[data-slot="radio-card-icon"]');
      const tileBox = await box(tile);
      const iconBox = await box(tile.locator('svg'));

      // Baldosa cuadrada con borde, no un círculo, y el ícono con presencia.
      expect(tileBox.width).toBe(tileBox.height);
      expect(tileBox.width).toBeGreaterThanOrEqual(40);
      expect(iconBox.width).toBeGreaterThanOrEqual(20);
      expect(await tile.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('1px');
      const radius = await tile.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
      expect(radius).toBeLessThan(tileBox.width / 2);

      const title = card.getByText(name, { exact: true });
      const description = title.locator('xpath=following-sibling::div[1]');
      expect(await fontSize(title)).toBeGreaterThan(await fontSize(description));
    }
  });

  test('el productor va a lo largo y los profesionales apilan ícono, título y bajada', async ({ page }) => {
    const producer = page.locator('label', { has: page.getByRole('radio', { name: /Productor/ }) });
    const producerIcon = await box(producer.locator('[data-slot="radio-card-icon"]'));
    const producerTitle = await box(producer.getByText('Productor', { exact: true }));
    // En una fila: el título arranca a la derecha del ícono, a la misma altura.
    expect(producerTitle.x).toBeGreaterThan(producerIcon.x + producerIcon.width);
    expect(producerTitle.y).toBeLessThan(producerIcon.y + producerIcon.height);

    for (const name of PROFESSIONALS) {
      const card = page.locator('label', { has: page.getByRole('radio', { name: new RegExp(name) }) });
      const cardBox = await box(card);
      const icon = await box(card.locator('[data-slot="radio-card-icon"]'));
      const control = await box(card.getByRole('radio'));
      const title = card.getByText(name, { exact: true });
      const titleBox = await box(title);
      const descriptionBox = await box(title.locator('xpath=following-sibling::div[1]'));

      // Ícono arriba a la izquierda y control arriba a la derecha.
      expect(icon.x - cardBox.x).toBeLessThan(24);
      expect(icon.y - cardBox.y).toBeLessThan(24);
      expect(cardBox.x + cardBox.width - (control.x + control.width)).toBeLessThan(24);
      expect(control.y).toBeLessThan(icon.y + icon.height);
      // Debajo, el título y después la bajada, alineados con el ícono.
      expect(titleBox.y).toBeGreaterThanOrEqual(icon.y + icon.height);
      expect(descriptionBox.y).toBeGreaterThanOrEqual(titleBox.y + titleBox.height - 1);
      expect(Math.abs(titleBox.x - icon.x)).toBeLessThan(2);
    }

    await page.getByRole('radio', { name: /Contador/ }).click();
    await expect(page.getByRole('radio', { name: /Contador/ })).toBeChecked();
  });
});
