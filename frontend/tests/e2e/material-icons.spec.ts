import { test, expect, type Page } from '@playwright/test';

/**
 * Migración de iconos a Google Material (react-icons/md): las pantallas públicas
 * renderizan los iconos como SVG y los controles que dependen de ellos siguen
 * funcionando. No requiere la API.
 */

function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

const iconErrors = (errors: string[]) =>
  errors.filter((e) => /phosphor|lucide|react-icons|Element type is invalid|createContext/i.test(e));

test.describe('Iconos Material en pantallas públicas', () => {
  test('el login muestra los iconos de los campos y el ojo alterna la contraseña', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/login');

    const password = page.getByLabel('Contraseña', { exact: true });
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute('type', 'password');

    const show = page.getByRole('button', { name: 'Ver contraseña' });
    await expect(show.locator('svg')).toBeVisible();
    await show.click();

    await expect(password).toHaveAttribute('type', 'text');
    const hide = page.getByRole('button', { name: 'Ocultar contraseña' });
    await expect(hide.locator('svg')).toBeVisible();
    await hide.click();
    await expect(password).toHaveAttribute('type', 'password');

    expect(iconErrors(errors)).toEqual([]);
  });

  test('el registro muestra el icono del correo y el ojo alterna la contraseña', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: 'Creá tu cuenta' })).toBeVisible();

    const email = page.getByRole('textbox', { name: 'Correo' });
    await expect(email).toBeVisible();
    // El icono del sobre vive en el addon del mismo grupo que el campo
    await expect(page.getByRole('group').filter({ has: email }).getByRole('img').first()).toBeVisible();

    const password = page.getByRole('textbox', { name: 'Contraseña', exact: true });
    await expect(password).toHaveAttribute('type', 'password');
    // Hay dos campos (contraseña y repetir): el primer ojo es el de Contraseña
    const show = page.getByRole('button', { name: 'Ver contraseña' }).first();
    await expect(show.locator('svg')).toBeVisible();
    await show.click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(page.getByRole('button', { name: 'Ocultar contraseña' }).locator('svg')).toBeVisible();

    expect(iconErrors(errors)).toEqual([]);
  });
});
