import { test, expect, type Page } from '@playwright/test';

/**
 * Base de Cashmere con la identidad de AgroNexo: los tokens de Cashmere (radius, sombras, motion, `input` como
 * fondo del campo, colores pop) apuntan a la paleta v4 y la tipografía global es Inter (la de Cashmere). Los controles actuales
 * conservan su borde sage-400 a través de `input-border`. No necesita backend.
 */

const COLOR = {
  white: 'rgb(255, 255, 255)',
  canvas: 'rgb(244, 246, 244)', // sage-50
  primary: 'rgb(62, 121, 73)', // field-700
  controlBorder: 'rgb(138, 143, 139)', // sage-400
};

/** Resuelve un token CSS a un valor computado aplicándolo a un elemento temporal. */
const resolveToken = (page: Page, property: string, token: string) =>
  page.evaluate(
    ([prop, value]) => {
      const probe = document.createElement('div');
      probe.style.setProperty(prop, value);
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).getPropertyValue(prop);
      probe.remove();
      return resolved;
    },
    [property, `var(${token})`] as const
  );

test.describe('Tema Cashmere con la identidad de AgroNexo', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('los tokens de Cashmere apuntan a la paleta verde campo', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: /Bienvenido a/ })).toBeVisible();

    expect(await resolveToken(page, 'border-top-left-radius', '--radius')).toBe('16px');
    expect(await resolveToken(page, 'background-color', '--background')).toBe(COLOR.canvas);
    expect(await resolveToken(page, 'background-color', '--primary')).toBe(COLOR.primary);
    expect(await resolveToken(page, 'background-color', '--input')).toBe(COLOR.white);
    expect(await resolveToken(page, 'background-color', '--input-border')).toBe(
      COLOR.controlBorder
    );
    expect(await resolveToken(page, 'color', '--destructive-foreground')).toBe(COLOR.white);
    expect(await resolveToken(page, 'transition-duration', '--default-transition-duration')).toBe(
      '0.15s'
    );

    const cardShadow = await resolveToken(page, 'box-shadow', '--shadow-s');
    expect(cardShadow).not.toBe('none');
  });

  test('la tipografía global es Inter, la de Cashmere, y no Geist', async ({ page }) => {
    await page.goto('/login');
    const heading = page.getByRole('heading', { level: 1, name: /Bienvenido a/ });
    await expect(heading).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    for (const target of [page.locator('body'), heading]) {
      const family = await target.evaluate((el) => getComputedStyle(el).fontFamily);
      expect(family).toMatch(/inter/i);
      expect(family).not.toMatch(/geist/i);
    }
  });

  test('los campos del login conservan el borde sage-400 sobre fondo blanco', async ({ page }) => {
    await page.goto('/login');

    const email = page.getByLabel('Correo');
    await expect(email).toBeVisible();
    expect(await email.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe(
      COLOR.controlBorder
    );
    expect(await email.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(COLOR.white);

    const submit = page.getByRole('button', { name: 'Iniciar sesión' });
    expect(await submit.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(COLOR.primary);
  });
});
