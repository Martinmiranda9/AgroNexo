import { test, expect, type Page } from '@playwright/test';

/**
 * Sidebar unificado en una sola columna (como la referencia "Taskify"): arriba el logo sin borde con el espacio del
 * usuario y el botón para colapsar, la búsqueda con forma de campo y Ctrl + K, "Menú principal" y "Mis campos" con los
 * campos del usuario; abajo ayuda y cierre de sesión. La barra de arriba ya no repite el logo en escritorio y muestra
 * dónde está el usuario.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario de prueba ya registrado
 * (productor o profesional), y la API levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
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
    {
      name: 'agronexo_sidebar',
      value: 'expanded',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
    },
  ]);
}

const sidebarOf = (page: Page) => page.getByRole('complementary', { name: 'Barra lateral' });

test.describe('Sidebar unificado en una columna', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');

  test.describe('en escritorio', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('es una sola columna blanca a toda la altura, pegada al borde izquierdo', async ({
      page,
    }) => {
      await signIn(page);
      await page.goto('/farms');

      const sidebar = sidebarOf(page);
      const box = (await sidebar.boundingBox())!;
      expect(box.x).toBe(0);
      expect(box.y).toBe(0);
      expect(box.height).toBeGreaterThanOrEqual(899);

      const styles = await sidebar.evaluate((el) => {
        const css = getComputedStyle(el);
        return { background: css.backgroundColor, borderRight: css.borderRightWidth };
      });
      expect(styles.background).toBe('rgb(255, 255, 255)');
      expect(styles.borderRight).toBe('1px');

      // Header, búsqueda, menú, campos y footer viven dentro de la misma columna.
      await expect(sidebar.getByRole('link', { name: 'AgroNexo — Inicio' })).toBeVisible();
      await expect(sidebar.getByRole('button', { name: 'Buscar' })).toBeVisible();
      await expect(sidebar.getByText('Menú principal')).toBeVisible();
      await expect(sidebar.getByText('Mis campos')).toBeVisible();
      await expect(sidebar.getByRole('button', { name: 'Ayuda' })).toBeVisible();
      await expect(sidebar.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    });

    test('el logo y el nombre van sin borde ni pastilla, con el espacio del usuario debajo', async ({
      page,
    }) => {
      await signIn(page);
      await page.goto('/farms');

      const logo = sidebarOf(page).getByRole('link', { name: 'AgroNexo — Inicio' });
      await expect(logo.getByText('AgroNexo', { exact: true })).toBeVisible();
      await expect(logo.getByText(/^Espacio del (productor|profesional)$/)).toBeVisible();

      const frame = await logo.evaluate((el) => {
        const own = getComputedStyle(el);
        const parent = getComputedStyle(el.parentElement!);
        return {
          border: own.borderTopWidth,
          shadow: own.boxShadow,
          parentBorder: parent.borderTopWidth,
          parentRadius: parent.borderTopLeftRadius,
        };
      });
      expect(frame.border).toBe('0px');
      expect(frame.shadow).toBe('none');
      expect(frame.parentBorder).toBe('0px');
      expect(frame.parentRadius).toBe('0px');

      // La barra de arriba ya no repite el logo en escritorio.
      await expect(
        page.getByRole('banner').getByRole('link', { name: 'AgroNexo — Inicio' })
      ).toBeHidden();
    });

    test('la búsqueda del sidebar abre la paleta y lleva a la sección elegida', async ({
      page,
    }) => {
      await signIn(page);
      await page.goto('/farms');

      await sidebarOf(page).getByRole('button', { name: 'Buscar' }).click();
      const search = page.getByRole('textbox', { name: 'Buscar secciones y campos' });
      await expect(search).toBeFocused();
      await search.fill('solicitudes');
      await search.press('Enter');
      await expect(page).toHaveURL(/\/matches$/);

      // Ctrl + K también la abre desde cualquier pantalla.
      await page.keyboard.press('Control+k');
      await expect(page.getByRole('textbox', { name: 'Buscar secciones y campos' })).toBeFocused();
    });

    test('"Mis campos" lista los campos del usuario y marca en pine el que está abierto', async ({
      page,
    }) => {
      await signIn(page);
      const workspaces = page.waitForResponse(
        (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/farms'
      );
      await page.goto('/farms');
      expect((await workspaces).status()).toBe(200);

      const farms = sidebarOf(page).getByRole('navigation', { name: 'Mis campos' });
      const firstFarm = farms
        .getByRole('link')
        .filter({ hasNotText: /^Ver todos/ })
        .first();
      test.skip(!(await firstFarm.isVisible()), 'El usuario de prueba no tiene campos');

      const name = (await firstFarm.innerText()).trim();
      await firstFarm.click();
      await expect(page).toHaveURL(/\/farms\/[^/]+$/);

      const current = sidebarOf(page)
        .getByRole('navigation', { name: 'Mis campos' })
        .getByRole('link', { name })
        .first();
      await expect(current).toHaveAttribute('aria-current', 'page');
      expect(await current.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(PINE);

      // Dentro de un campo de la lista, "Campos" deja de ser el activo y la barra de arriba muestra la ruta.
      await expect(
        sidebarOf(page)
          .getByRole('navigation', { name: 'Principal' })
          .getByRole('link', { name: 'Campos' })
      ).not.toHaveAttribute('aria-current', 'page');
      const breadcrumb = page.getByRole('banner').getByRole('navigation', { name: 'Ruta' });
      await expect(breadcrumb.getByRole('link', { name: 'Campos' })).toBeVisible();
      await expect(breadcrumb.getByText(name, { exact: true })).toBeVisible();
    });

    test('el "+" de "Mis campos" abre el alta de un campo (productor)', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      const add = sidebarOf(page).getByRole('link', { name: 'Nuevo campo' });
      test.skip(!(await add.isVisible()), 'Solo el productor crea campos');

      await add.click();
      await expect(page).toHaveURL(/\/farms\?nuevo=1$/);
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page).toHaveURL(/\/farms$/);
    });

    test('colapsado quedan los íconos, también la búsqueda, con el nombre en tooltip', async ({
      page,
    }) => {
      await signIn(page);
      await page.goto('/farms');

      const sidebar = sidebarOf(page);
      await sidebar.getByRole('button', { name: 'Contraer menú' }).click();
      await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
      expect((await sidebar.boundingBox())!.width).toBeLessThanOrEqual(80);

      // El rótulo queda solo para el lector de pantalla (1 px).
    expect(
      await sidebar.getByText('Menú principal').evaluate((el) => el.getBoundingClientRect().width)
    ).toBeLessThanOrEqual(1);
      await sidebar.getByRole('button', { name: 'Buscar' }).hover();
      await expect(page.getByRole('tooltip').filter({ hasText: 'Buscar' })).toBeVisible();

      await sidebar.getByRole('button', { name: 'Expandir menú' }).click();
      await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });
  });

  test.describe('en celular', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('el menú abre la misma columna, con la búsqueda y los campos', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        375
      );
      await expect(
        page.getByRole('banner').getByRole('link', { name: 'AgroNexo — Inicio' })
      ).toBeVisible();

      await page.getByRole('button', { name: 'Abrir menú' }).click();
      const panel = page.getByRole('dialog', { name: 'Menú' });
      await expect(panel.getByRole('button', { name: 'Buscar' })).toBeVisible();
      await expect(panel.getByText('Mis campos')).toBeVisible();
      await expect(panel.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    });
  });
});
