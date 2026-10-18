import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * Pantallas públicas migradas a Cashmere con la identidad de AgroNexo: botones pill, campos de Cashmere con borde
 * sage-400, PasswordInput, barra de pasos del onboarding y las "Checkbox Cards" (radio y checkbox) con lo
 * seleccionado en pine. No necesita backend.
 */

const COLOR = {
  white: 'rgb(255, 255, 255)',
  pine: 'rgb(0, 49, 30)',
  primary: 'rgb(62, 121, 73)', // field-700
  controlBorder: 'rgb(138, 143, 139)', // sage-400
  destructive: 'rgb(185, 28, 28)',
};

const css = (locator: Locator, property: string) =>
  locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

/** Pill: el radio llega al menos a la mitad del alto (rounded-full). */
async function expectPill(locator: Locator) {
  const { radius, height } = await locator.evaluate((el) => ({
    radius: parseFloat(getComputedStyle(el).borderTopLeftRadius),
    height: el.getBoundingClientRect().height,
  }));
  expect(radius).toBeGreaterThanOrEqual(height / 2);
}

async function fillPersonalStep(page: Page) {
  await page.getByLabel('Nombre', { exact: true }).fill('Prueba');
  await page.getByLabel('Apellido', { exact: true }).fill(`Cashmere${Date.now()}`);
  await page.getByLabel('DNI o CUIT').fill('20304050600');
  await page.getByLabel('WhatsApp').fill('+54 9 351 555 0199');
  await page.getByRole('button', { name: /Continuar/ }).click();
}

test.describe('Pantallas públicas con Cashmere', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('el login usa botones pill, campos de Cashmere y el ojo de PasswordInput', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: /Bienvenido a/ })).toBeVisible();

    const submit = page.getByRole('button', { name: 'Iniciar sesión' });
    await expectPill(submit);
    expect(await css(submit, 'background-color')).toBe(COLOR.primary);

    const google = page.getByRole('button', { name: 'Continuar con Google' });
    await expectPill(google);
    expect(await css(google, 'background-color')).not.toBe(COLOR.primary);

    const email = page.getByLabel('Correo');
    expect(await css(email, 'border-top-color')).toBe(COLOR.controlBorder);
    expect(await css(email, 'background-color')).toBe(COLOR.white);

    const password = page.getByLabel('Contraseña', { exact: true });
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Ver contraseña' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Ocultar contraseña' }).click();
    await expect(password).toHaveAttribute('type', 'password');

    // El divisor va en minúscula, sin mayúsculas espaciadas (regla de Cashmere).
    await expect(page.getByText('o', { exact: true })).toHaveCSS('text-transform', 'none');
  });

  test('el login marca en rojo los campos vacíos al enviar', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // InlineValidation pinta el error y lo repite en una región sr-only para el lector de pantalla: se verifica el
    // texto visible (el primero) y que el campo quede descrito por el error.
    const email = page.getByLabel('Correo');
    await expect(page.getByText('Ingresá tu correo.').first()).toBeVisible();
    await expect(email).toHaveAccessibleDescription('Ingresá tu correo.');
    await expect(page.getByText('Ingresá tu contraseña.')).toBeVisible();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect.poll(() => css(email, 'border-top-color')).toBe(COLOR.destructive);
  });

  test('restablecer contraseña usa el campo y el botón de Cashmere', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: 'Restablecer contraseña' })).toBeVisible();
    const email = page.getByLabel('Correo');
    expect(await css(email, 'border-top-color')).toBe(COLOR.controlBorder);
    const send = page
      .getByRole('button')
      .filter({ hasText: /enlace|Enviar/i })
      .first();
    await expectPill(send);
  });

  test('el onboarding muestra la barra de pasos segmentada de Cashmere', async ({ page }) => {
    await page.goto('/onboarding');
    const progress = page.getByRole('progressbar', { name: /Paso 1 de/ });
    await expect(progress).toBeVisible();

    const segments = progress.locator('[data-step-state]');
    expect(await segments.count()).toBeGreaterThan(1);
    await expect(segments.first()).toHaveAttribute('data-step-state', 'current');
    await expect(segments.nth(1)).toHaveAttribute('data-step-state', 'upcoming');
  });

  test('el checkbox de términos del onboarding se marca en pine', async ({ page }) => {
    await page.goto('/onboarding');
    const terms = page.getByRole('checkbox', { name: /Al continuar aceptás/ });
    await expect(terms).toBeVisible();
    await terms.click();
    await expect(terms).toHaveAttribute('aria-checked', 'true');
    await expect.poll(() => css(terms, 'background-color')).toBe(COLOR.pine);
  });

  test('las opciones del productor son cards con la selección en pine', async ({ page }) => {
    // Los pasos de datos llegan después de crear la cuenta en Firebase: hace falta una sesión real.
    test.skip(
      !process.env.E2E_SESSION_TOKEN,
      'Requiere E2E_SESSION_TOKEN (usuario de prueba con cuenta creada)'
    );
    await page
      .context()
      .addCookies([
        {
          name: 'agronexo_session',
          value: process.env.E2E_SESSION_TOKEN!,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
        },
      ]);
    await page.goto('/onboarding?type=producer');
    await fillPersonalStep(page);

    await page.getByLabel('Provincia / Región').selectOption({ label: 'Buenos Aires' });
    await page.getByLabel('Ciudad / Localidad').selectOption({ index: 1 });
    await page.getByRole('button', { name: /Continuar/ }).click();

    // Opción única: RadioGroup + RadioCard.
    const mixed = page.getByRole('radio', { name: /Mixto/ });
    await mixed.click();
    await expect(mixed).toHaveAttribute('aria-checked', 'true');
    const radioCard = page.locator('[data-slot="radio-card"]').filter({ has: mixed });
    await expect.poll(() => css(radioCard, 'border-top-color')).toBe(COLOR.pine);
    expect(await css(mixed, 'background-color')).toBe(COLOR.pine);

    await page.getByLabel('Superficie total').selectOption('From100To500');
    await page.getByRole('button', { name: /Continuar/ }).click();

    // Opción múltiple: CheckboxCard.
    const lawyer = page.getByRole('checkbox', { name: 'Abogado' });
    await lawyer.click();
    await expect(lawyer).toHaveAttribute('aria-checked', 'true');
    const checkboxCard = page.locator('[data-slot="checkbox-card"]').filter({ has: lawyer });
    await expect.poll(() => css(checkboxCard, 'border-top-color')).toBe(COLOR.pine);
  });

  test('la página 404 mantiene el lienzo salvia y el botón pill', async ({ page }) => {
    await page.goto('/no-existe');
    // El Button de Base UI con un Link adentro conserva el rol de botón.
    const home = page.getByRole('button', { name: 'Volver al inicio' });
    await expect(home).toBeVisible();
    await expectPill(home);
  });
});
