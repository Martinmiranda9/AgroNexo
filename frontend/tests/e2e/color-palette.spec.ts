import { test, expect, type Locator } from '@playwright/test';

/**
 * Paleta v4 "verde campo" en las pantallas públicas: superficie blanca, lienzo salvia, botón principal en verde
 * campo 700, selección en pine, bordes de control neutros y rojo real para los errores. No necesita backend.
 */

const COLOR = {
  white: 'rgb(255, 255, 255)',
  canvas: 'rgb(244, 246, 244)', // sage-50
  pine: 'rgb(0, 49, 30)', // field-950
  primary: 'rgb(62, 121, 73)', // field-700
  controlBorder: 'rgb(138, 143, 139)', // sage-400
  secondaryText: 'rgb(90, 95, 91)', // sage-600
  danger: 'rgb(185, 28, 28)', // red-700
};

/** Crema y marfil de la paleta anterior: no deberían quedar como fondo de ninguna pantalla. */
const OLD_CREAMS = ['rgb(254, 247, 229)', 'rgb(255, 251, 240)'];

const style = (
  locator: Locator,
  property: 'backgroundColor' | 'color' | 'borderTopColor' | 'borderTopWidth' | 'boxShadow'
) => locator.evaluate((el, prop) => getComputedStyle(el)[prop], property);

/** Fondo que se ve detrás del elemento: el del primer ancestro que pinta un color (no transparente). */
const visibleBackground = (locator: Locator) =>
  locator.evaluate((el) => {
    for (let node: Element | null = el; node; node = node.parentElement) {
      const color = getComputedStyle(node).backgroundColor;
      if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
    }
    return getComputedStyle(document.body).backgroundColor;
  });

test.describe('Paleta verde campo en las pantallas públicas', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('el login tiene formulario blanco, botón verde campo y el panel de marca en pine', async ({
    page,
  }) => {
    await page.goto('/login');

    const heading = page.getByRole('heading', { level: 1, name: /Bienvenido a/ });
    await expect(heading).toBeVisible();
    expect(await style(heading, 'color')).toBe(COLOR.pine);

    const formBackground = await visibleBackground(heading);
    expect(formBackground).toBe(COLOR.white);
    expect(OLD_CREAMS).not.toContain(formBackground);

    const submit = page.getByRole('button', { name: 'Iniciar sesión' });
    expect(await style(submit, 'backgroundColor')).toBe(COLOR.primary);
    expect(await style(submit, 'color')).toBe(COLOR.white);

    // EmailField (InlineValidation) pinta el borde en el propio input.
    expect(await style(page.getByLabel('Correo'), 'borderTopColor')).toBe(COLOR.controlBorder);

    const showcase = page.getByRole('heading', { name: 'Tu campo, conectado.' });
    await expect(showcase).toBeVisible();
    expect(await visibleBackground(showcase)).toBe(COLOR.pine);

    expect(await style(page.locator('body'), 'backgroundColor')).toBe(COLOR.canvas);
  });

  test('los errores del login se muestran en rojo real', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    const error = page.getByRole('alert').first();
    await expect(error).toBeVisible();
    expect(await style(error, 'color')).toBe(COLOR.danger);
  });

  test('el onboarding comparte la paleta: texto secundario gris, selección pine y botón verde campo', async ({
    page,
  }) => {
    await page.goto('/onboarding');

    const heading = page.getByRole('heading', { name: 'Creá tu cuenta' });
    await expect(heading).toBeVisible();
    expect(await style(heading, 'color')).toBe(COLOR.pine);
    expect(await visibleBackground(heading)).toBe(COLOR.white);

    const intro = page.getByText('Ingresá con Google o con tu correo.');
    expect(await style(intro, 'color')).toBe(COLOR.secondaryText);

    // "Continuar con Google" es el Button secondary de Cashmere: sin borde, el contorno es el anillo de sombra.
    const google = page.getByRole('button', { name: 'Continuar con Google' });
    expect(await style(google, 'borderTopWidth')).toBe('0px');
    expect(await style(google, 'boxShadow')).not.toBe('none');
    expect(await style(google, 'backgroundColor')).not.toBe(COLOR.primary);

    const terms = page.getByRole('checkbox', { name: /Al continuar aceptás/ });
    await terms.click();
    await expect(terms).toBeChecked();
    // El checkbox anima el color (transition-colors): se espera a que termine.
    await expect.poll(() => style(terms, 'backgroundColor')).toBe(COLOR.pine);

    const create = page.getByRole('button', { name: 'Crear cuenta' });
    expect(await style(create, 'backgroundColor')).toBe(COLOR.primary);
  });

  test('la página 404 usa el lienzo salvia y el botón principal', async ({ page }) => {
    await page.goto('/esta-ruta-no-existe');

    await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();
    expect(await style(page.locator('body'), 'backgroundColor')).toBe(COLOR.canvas);

    const home = page.getByRole('button', { name: 'Volver al inicio' });
    expect(await style(home, 'backgroundColor')).toBe(COLOR.primary);
  });
});
