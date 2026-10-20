import { test, expect, type Page } from '@playwright/test';

/**
 * Herramientas de tabla tomadas de la referencia "Uxerflow" en el tablero del campo: casillas para elegir actividades,
 * barra flotante con el cambio de estado en lote, orden por fecha, filas por página y paginación; además, las caras
 * del equipo junto al saludo y la casilla destacada en pine (no en verde de marca, que queda para el botón principal).
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario de prueba registrado que
 * tenga al menos un campo, y la API levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;
const PINE = 'rgb(0, 49, 30)';

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
  const farmLink = page
    .getByRole('main')
    .getByRole('link')
    .filter({ hasNotText: /^Campos$/ })
    .first();
  await expect(farmLink).toBeVisible();
  await farmLink.click();
  await expect(page).toHaveURL(/\/farms\/[^/]+$/);
}

const activityTable = (page: Page) => page.getByRole('main').getByRole('table');

test.describe('Tablero del campo: herramientas de la tabla de actividad', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await openFirstFarm(page);
  });

  test('la casilla destacada de la campaña va en pine y el saludo muestra al equipo', async ({
    page,
  }) => {
    const highlighted = page.locator('[data-slot="stat-card"][data-tone="brand"]');
    await expect(highlighted).toBeVisible();
    const background = await highlighted.evaluate((el) => {
      const css = getComputedStyle(el);
      return { color: css.backgroundColor, image: css.backgroundImage };
    });
    expect(background.color).toBe(PINE);
    expect(background.image).toBe('none');

    await expect(page.getByRole('group', { name: /^Equipo del campo:/ })).toBeVisible();
  });

  test('elegir actividades muestra la barra con la cantidad, y Escape la limpia', async ({
    page,
  }) => {
    const table = activityTable(page);
    test.skip(!(await table.isVisible()), 'El campo de prueba no tiene actividades');

    const rowBoxes = table.getByRole('checkbox', { name: /^Elegir (?!todas)/ });
    const enabled = rowBoxes.and(page.locator(':not([data-disabled])'));
    test.skip((await enabled.count()) === 0, 'El usuario no puede editar ninguna actividad');

    await enabled.first().click();
    const bar = page.getByRole('toolbar', { name: 'Acciones sobre lo seleccionado' });
    await expect(bar).toBeVisible();
    await expect(bar).toContainText('1 actividad elegida');
    await expect(table.locator('tbody tr[data-state="selected"]')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(bar).toBeHidden();
    await expect(enabled.first()).not.toBeChecked();
  });

  test('"elegir todas" marca las editables de la página y queda a medias si se saca una', async ({
    page,
  }) => {
    const table = activityTable(page);
    test.skip(!(await table.isVisible()), 'El campo de prueba no tiene actividades');

    const all = table.getByRole('checkbox', {
      name: 'Elegir todas las actividades de esta página',
    });
    test.skip(await all.isDisabled(), 'El usuario no puede editar ninguna actividad');

    await all.click();
    await expect(all).toBeChecked();
    const bar = page.getByRole('toolbar', { name: 'Acciones sobre lo seleccionado' });
    await expect(bar).toBeVisible();

    const checked = table.getByRole('checkbox', { name: /^Elegir (?!todas)/, checked: true });
    if ((await checked.count()) > 1) {
      await checked.first().click();
      await expect(all).toHaveAttribute('aria-checked', 'mixed');
    }

    await bar.getByRole('button', { name: 'Quitar la selección' }).click();
    await expect(bar).toBeHidden();
  });

  test('la barra cambia el estado de lo elegido y avisa cuántas pasaron', async ({ page }) => {
    const table = activityTable(page);
    test.skip(!(await table.isVisible()), 'El campo de prueba no tiene actividades');

    // Una actividad editable que todavía no esté finalizada.
    const row = table
      .locator('tbody tr')
      .filter({ has: page.locator('[data-slot="checkbox"]:not([data-disabled])') })
      .filter({ hasNotText: 'Finalizado' })
      .first();
    test.skip(!(await row.isVisible()), 'No hay actividades editables sin finalizar');

    await row.getByRole('checkbox').click();
    const bar = page.getByRole('toolbar', { name: 'Acciones sobre lo seleccionado' });

    const saved = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' && /\/farms\/[^/]+$/.test(new URL(res.url()).pathname)
    );
    await bar.getByRole('button', { name: 'Pasar a finalizado' }).click();
    expect((await saved).status()).toBe(200);

    await expect(page.getByText('1 actividad pasó a finalizado')).toBeVisible();
    await expect(bar).toBeHidden();
  });

  test('la fecha ordena de la más nueva a la más vieja y al revés', async ({ page }) => {
    const table = activityTable(page);
    test.skip(!(await table.isVisible()), 'El campo de prueba no tiene actividades');

    const dateHeader = table.getByRole('columnheader').filter({ hasText: 'Fecha' });
    await expect(dateHeader).toHaveAttribute('aria-sort', 'descending');
    await dateHeader.getByRole('button').click();
    await expect(dateHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  test('las filas por página limitan la tabla y la paginación avanza', async ({ page }) => {
    const table = activityTable(page);
    test.skip(!(await table.isVisible()), 'El campo de prueba no tiene actividades');

    await page.getByLabel('Filas por página').selectOption('5');
    const bodyRows = table.locator('tbody tr');
    expect(await bodyRows.count()).toBeLessThanOrEqual(5);

    const pagination = page.getByRole('navigation', { name: 'Paginación' });
    test.skip(!(await pagination.isVisible()), 'El campo de prueba tiene 5 actividades o menos');

    await expect(pagination.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(pagination.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    await pagination.getByRole('button', { name: 'Página siguiente' }).click();
    await expect(pagination.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(page.getByText(/^6–\d+ de \d+$/)).toBeVisible();
  });
});
