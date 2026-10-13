import { test, expect, type Page } from '@playwright/test';

/**
 * Barra lateral de las pantallas autenticadas (paleta v4): fondo pine, ítem activo en verde campo 800, navegación
 * entre secciones y cierre de sesión. En celular la barra se oculta y queda el encabezado.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un usuario de prueba ya registrado,
 * y la API levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;

const COLOR = {
  pine: 'rgb(0, 49, 30)', // field-950
  active: 'rgb(41, 96, 59)', // field-800
};

async function signIn(page: Page) {
  await page.context().addCookies([
    { name: 'agronexo_session', value: SESSION_TOKEN!, domain: 'localhost', path: '/', httpOnly: true },
  ]);
}

test.describe('Barra lateral de la app', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');

  test.describe('en escritorio', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('muestra la navegación sobre pine con la sección actual marcada', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      const nav = page.getByRole('navigation', { name: 'Principal' }).filter({ hasText: 'Campos' }).first();
      await expect(nav).toBeVisible();

      const sidebarBackground = await nav.evaluate((el) => getComputedStyle(el.closest('aside')!).backgroundColor);
      expect(sidebarBackground).toBe(COLOR.pine);

      const current = nav.getByRole('link', { name: 'Campos' });
      await expect(current).toHaveAttribute('aria-current', 'page');
      await expect.poll(() => current.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(COLOR.active);

      await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    });

    test('lleva a otra sección y mueve el ítem activo', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      const nav = page.getByRole('navigation', { name: 'Principal' }).filter({ hasText: 'Campos' }).first();
      // Productor: "Mis solicitudes"; profesional: "Solicitudes".
      const requests = nav.getByRole('link', { name: /Solicitudes/i });
      await requests.click();

      await expect(page).toHaveURL(/\/matches$/);
      await expect(requests).toHaveAttribute('aria-current', 'page');
      await expect(nav.getByRole('link', { name: 'Campos' })).not.toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('en celular', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('oculta la barra lateral y deja el encabezado con la navegación', async ({ page }) => {
      await signIn(page);
      await page.goto('/farms');

      await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();
      await expect(page.getByRole('link', { name: 'AgroNexo — Inicio' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Campos' }).filter({ visible: true })).toHaveCount(1);
    });
  });
});
