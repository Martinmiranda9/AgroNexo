import { test, expect, type Page } from '@playwright/test';

/**
 * Marco nuevo de las pantallas autenticadas (estructura de la referencia del tablero): sidebar de pastillas que se
 * colapsa a íconos con tooltip y recuerda la elección, y encabezado con búsqueda (Ctrl + K), avisos, ayuda y perfil.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario de prueba ya registrado
 * (productor o profesional), y la API levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;

const PINE = 'rgb(0, 49, 30)';

async function signIn(page: Page, sidebar?: 'collapsed' | 'expanded') {
  const cookies = [
    {
      name: 'agronexo_session',
      value: SESSION_TOKEN!,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    },
  ];
  if (sidebar)
    cookies.push({
      name: 'agronexo_sidebar',
      value: sidebar,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
    });
  await page.context().addCookies(cookies);
}

const sidebarOf = (page: Page) => page.getByRole('complementary', { name: 'Barra lateral' });

test.describe('Marco de la app: sidebar y encabezado', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');

  test.describe('en escritorio', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('el sidebar arranca expandido y marca en pine la sección actual', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      const sidebar = sidebarOf(page);
      await expect(sidebar).toBeVisible();
      await expect(sidebar.getByRole('button', { name: 'Contraer menú' })).toBeVisible();

      const current = sidebar.getByRole('link', { name: 'Campos' });
      await expect(current).toHaveAttribute('aria-current', 'page');
      expect(await current.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(PINE);
      await expect(current.getByText('Campos')).toBeVisible();
    });

    test('se colapsa a íconos, muestra el nombre al pasar el mouse y recuerda la elección', async ({
      page,
    }) => {
      await signIn(page, 'expanded');
      await page.goto('/farms');

      const sidebar = sidebarOf(page);
      const expandedWidth = (await sidebar.boundingBox())!.width;

      await sidebar.getByRole('button', { name: 'Contraer menú' }).click();
      await expect(sidebar.getByRole('button', { name: 'Expandir menú' })).toBeVisible();
      await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
      await expect
        .poll(async () => (await sidebar.boundingBox())!.width)
        .toBeLessThan(expandedWidth / 2);

      // El texto queda solo para el lector de pantalla; el nombre aparece en el tooltip.
      const farms = sidebar.getByRole('link', { name: 'Campos' });
      expect(
        await farms.getByText('Campos').evaluate((el) => el.getBoundingClientRect().width)
      ).toBeLessThanOrEqual(1);
      await farms.hover();
      await expect(page.getByRole('tooltip').filter({ hasText: 'Campos' })).toBeVisible();

      await page.reload();
      await expect(sidebarOf(page)).toHaveAttribute('data-collapsed', 'true');

      await sidebarOf(page).getByRole('button', { name: 'Expandir menú' }).click();
      await expect(sidebarOf(page)).toHaveAttribute('data-collapsed', 'false');
      await expect(
        sidebarOf(page).getByRole('link', { name: 'Campos' }).getByText('Campos')
      ).toBeVisible();
    });

    test('la lupa busca secciones con Ctrl + K y lleva a la elegida', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      // Al abrirse pide los campos del usuario (acción del servidor sobre la misma página).
      const farmsLoaded = page.waitForResponse(
        (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/farms'
      );
      await page.keyboard.press('Control+k');
      const search = page.getByRole('textbox', { name: 'Buscar secciones y campos' });
      await expect(search).toBeFocused();
      expect((await farmsLoaded).status()).toBe(200);

      await search.fill('solicitudes');
      await expect(page.getByRole('option', { name: /solicitudes/i })).toBeVisible();
      await search.press('Enter');
      await expect(page).toHaveURL(/\/matches$/);
      await expect(sidebarOf(page).getByRole('link', { name: /solicitudes/i })).toHaveAttribute(
        'aria-current',
        'page'
      );
    });

    test('la búsqueda avisa cuando no hay resultados', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      await page.getByRole('banner').getByRole('button', { name: 'Buscar' }).click();
      await page.getByRole('textbox', { name: 'Buscar secciones y campos' }).fill('zzzz-no-existe');
      await expect(page.getByText('Sin resultados')).toBeVisible();
    });

    test('la campana muestra que no hay novedades', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      await page.getByRole('banner').getByRole('button', { name: 'Avisos' }).click();
      const popover = page.getByRole('dialog').filter({ hasText: 'Avisos' });
      await expect(popover.getByText('Sin novedades')).toBeVisible();
    });

    test('el ícono de información abre la guía de la pantalla', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      await page.getByRole('banner').getByRole('button', { name: 'Ayuda' }).click();
      const guide = page.getByRole('dialog').filter({ hasText: 'Cómo usar esta pantalla' });
      await expect(guide.getByText('Campos', { exact: true })).toBeVisible();
      await expect(
        guide.getByText('Cada campo es el espacio de trabajo con tu equipo.')
      ).toBeVisible();
    });

    test('"Ayuda" del sidebar abre la misma guía', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      await sidebarOf(page).getByRole('button', { name: 'Ayuda' }).click();
      await expect(
        page.getByRole('dialog').filter({ hasText: 'Cómo usar esta pantalla' })
      ).toBeVisible();
    });

    test('el perfil muestra nombre y rol, y su menú permite cerrar sesión', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      const profile = page.getByRole('button', { name: /menú de la cuenta/ });
      await expect(profile.getByText(/^(Productor|Profesional)$/)).toBeVisible();
      const nameWeight = await profile
        .locator('span.font-semibold')
        .first()
        .evaluate((el) => getComputedStyle(el).fontWeight);
      expect(Number(nameWeight)).toBeGreaterThanOrEqual(600);

      await profile.click();
      await expect(page.getByRole('menuitem', { name: 'Cerrar sesión' })).toBeVisible();
    });
  });

  test.describe('en celular', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('el sidebar se abre en un panel lateral desde el botón de menú', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      // Sin scroll horizontal: el encabezado entra en 375 px.
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        375
      );

      await page.getByRole('button', { name: 'Abrir menú' }).click();
      const panel = page.getByRole('dialog', { name: 'Menú' });
      await expect(panel.getByRole('link', { name: 'Campos' })).toBeVisible();
      await expect(panel.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();

      await panel.getByRole('link', { name: /solicitudes/i }).click();
      await expect(page).toHaveURL(/\/matches$/);
      await expect(panel).toBeHidden();
    });
  });
});
