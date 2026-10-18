import { test, expect, type Page } from '@playwright/test';

/**
 * Campo de correo de AgroNexo: el "Inline validation" de Cashmere en login, crear cuenta y restablecer contraseña.
 * Sin ícono de sobre adentro; valida mientras se escribe (con un pequeño retardo) y al salir del campo, y muestra
 * también el error del formulario al enviar. No necesita backend.
 */

const COLOR = {
  white: 'rgb(255, 255, 255)',
  controlBorder: 'rgb(138, 143, 139)', // sage-400
  destructive: 'rgb(185, 28, 28)',
};

const SCREENS = [
  { name: 'login', path: '/login' },
  { name: 'crear cuenta', path: '/onboarding' },
  { name: 'restablecer contraseña', path: '/forgot-password' },
];

const emailInput = (page: Page) => page.getByLabel('Correo', { exact: true });

test.describe('Campo de correo con Inline validation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const { name, path } of SCREENS) {
    test(`en ${name} no tiene ícono y valida el correo al escribir`, async ({ page }) => {
      await page.goto(path);
      const email = emailInput(page);
      await expect(email).toBeVisible();
      await expect(email).toHaveAttribute('type', 'email');

      // Sin el sobre: el campo no vive en un InputGroup con addon.
      await expect(page.locator('[data-slot="input-group"]').filter({ has: email })).toHaveCount(0);
      expect(await email.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe(
        COLOR.controlBorder
      );
      expect(await email.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(COLOR.white);

      await email.fill('martin@');
      await email.blur();
      await expect(page.getByText('Ingresá un correo válido.')).toBeVisible();
      await expect(email).toHaveAttribute('aria-invalid', 'true');
      await expect
        .poll(() => email.evaluate((el) => getComputedStyle(el).borderTopColor))
        .toBe(COLOR.destructive);

      // Al corregirlo, el error se va.
      await email.fill('martin@campo.com');
      await expect(email).toHaveAttribute('aria-invalid', 'false');
      await expect(page.getByText('Ingresá un correo válido.')).toBeHidden();
    });
  }

  test('en el login, enviar vacío marca el correo con el error del formulario', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    const email = emailInput(page);
    await expect(page.getByText('Ingresá tu correo.')).toBeVisible();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
  });
});

test.describe('Roles del registro con ícono', () => {
  test('cada rol muestra su ícono Material y se pinta de pine al elegirlo', async ({ page }) => {
    // El paso de rol llega después de crear la cuenta en Firebase: hace falta una sesión real.
    test.skip(
      !process.env.E2E_SESSION_TOKEN,
      'Requiere E2E_SESSION_TOKEN (usuario de prueba con cuenta creada)'
    );
    await page.context().addCookies([
      {
        name: 'agronexo_session',
        value: process.env.E2E_SESSION_TOKEN!,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
    ]);
    await page.goto('/onboarding');

    const producer = page.getByRole('radio', { name: /Productor/ });
    await expect(producer).toBeVisible();
    const card = page.locator('[data-slot="radio-card"]').filter({ has: producer });
    const icon = card.locator('span[aria-hidden] svg');
    await expect(icon).toBeVisible();

    await producer.click();
    await expect
      .poll(() =>
        icon.evaluate((el) => getComputedStyle(el.parentElement as HTMLElement).color)
      )
      .toBe('rgb(0, 49, 30)');
  });
});
