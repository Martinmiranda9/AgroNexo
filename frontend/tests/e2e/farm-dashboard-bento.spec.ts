import { test, expect, type Page } from '@playwright/test';

/**
 * Tablero del campo con la estructura del tablero de referencia: saludo según la hora, primera fila con la superficie
 * y los lotes, las cuatro casillas de la campaña y el avance de labores, y segunda fila con la campaña, el equipo y la
 * actividad reciente con búsqueda y filtro.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario de prueba registrado que
 * tenga al menos un campo, y la API levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
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

/** Entra al primer campo de la lista y devuelve su nombre. */
async function openFirstFarm(page: Page) {
  await page.goto('/farms');
  const farmLink = page
    .getByRole('main')
    .getByRole('link')
    .filter({ hasNotText: /^Campos$/ })
    .first();
  await expect(farmLink).toBeVisible();
  const name = (await farmLink.innerText()).split('\n')[0].trim();
  await farmLink.click();
  await expect(page).toHaveURL(/\/farms\/[^/]+$/);
  return name;
}

test.describe('Tablero del campo como el de referencia', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('saluda según la hora y dice de qué campo es el tablero', async ({ page }) => {
    const name = await openFirstFarm(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /^(Buenos días|Buenas tardes|Buenas noches)/ })
    ).toBeVisible();
    await expect(page.getByRole('main').getByText(name, { exact: true }).first()).toBeVisible();
  });

  test('la primera fila muestra superficie y lotes, las cuatro casillas y el avance de labores', async ({
    page,
  }) => {
    await openFirstFarm(page);
    const main = page.getByRole('main');

    await expect(main.getByText('Superficie del campo')).toBeVisible();
    await expect(main.getByText('Lotes', { exact: true })).toBeVisible();
    for (const label of ['Sembrado', 'Cultivos', 'En curso', 'Equipo']) {
      await expect(main.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(main.getByRole('heading', { name: 'Avance de labores' })).toBeVisible();

    // Las tres cards de la fila arrancan a la misma altura, como en la referencia.
    const tops = await Promise.all(
      [
        main.getByText('Superficie del campo'),
        main.getByText('Sembrado', { exact: true }).first(),
        main.getByRole('heading', { name: 'Avance de labores' }),
      ].map(async (locator) =>
        locator.evaluate((el) => el.closest('[data-slot="card"]')!.getBoundingClientRect().top)
      )
    );
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(2);
  });

  test('la segunda fila muestra la campaña, el equipo y la actividad reciente', async ({
    page,
  }) => {
    await openFirstFarm(page);
    const main = page.getByRole('main');

    await expect(main.getByRole('heading', { name: /^Campaña/ })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Equipo' })).toBeVisible();
    await expect(main.getByText('Productor', { exact: true }).first()).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Actividad reciente' })).toBeVisible();
  });

  test('la búsqueda de la actividad reciente filtra la tabla', async ({ page }) => {
    await openFirstFarm(page);
    const search = page.getByRole('searchbox', { name: 'Buscar actividades' });
    test.skip(!(await search.isVisible()), 'El campo de prueba no tiene actividades');

    await search.fill('zzzz-no-existe');
    await expect(page.getByText('No hay actividades con esa búsqueda o estado.')).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
    await expect(page.getByRole('table').getByRole('row')).not.toHaveCount(1);
  });

  test('"Nueva actividad" abre el panel para registrarla', async ({ page }) => {
    await openFirstFarm(page);
    const newActivity = page.getByRole('main').getByRole('button', { name: 'Nueva actividad' });
    test.skip(!(await newActivity.isVisible()), 'El campo de prueba está archivado');

    await newActivity.click();
    await expect(page.getByRole('dialog', { name: 'Nueva actividad' })).toBeVisible();
  });

  test('en celular las cards se apilan sin scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openFirstFarm(page);

    await expect(page.getByText('Superficie del campo')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      375
    );
  });
});
