import { test, expect, type Page } from '@playwright/test';

/**
 * Entrada de Buscar rediseñada como un chat: en el centro el isotipo, "Hola, {nombre}" grande y liviano, qué hacer y
 * los tags de búsquedas posibles (pills blancas con el ícono de la profesión en un círculo verde); abajo, el AI Agent
 * Input de Cashmere solo con micrófono y enviar. De fondo, un brillo de verde campo que crece hacia abajo a la derecha
 * y se ve también detrás de la barra de arriba.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un productor ya registrado, y la API
 * levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;

const EXAMPLES = [
  'Contador para retenciones de granos',
  'Agrónomo para la fina, por ambientes',
  'Revisar un contrato de arrendamiento',
  'Financiar la campaña',
];

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

const promptOf = (page: Page) => page.getByRole('textbox', { name: '¿Qué necesitás?' });
const examplesOf = (page: Page) => page.getByRole('group', { name: 'Probá con' });

test.describe('Entrada de Buscar profesionales', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test.describe('en escritorio', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/match-discovery');
      await expect(promptOf(page)).toBeVisible();
    });

    test('saluda al productor por su nombre, grande y sin negrita, con qué hacer debajo', async ({
      page,
    }) => {
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toHaveText(/^Hola(, \S.*)?$/);
      const style = await title.evaluate((el) => {
        const s = getComputedStyle(el);
        return { fontSize: s.fontSize, fontWeight: s.fontWeight };
      });
      expect(style).toEqual({ fontSize: '44px', fontWeight: '500' });

      const subtitle = page.getByText(
        'Contanos qué necesita tu campo y te mostramos los profesionales que mejor encajan, y por qué.'
      );
      await expect(subtitle).toBeVisible();
      expect((await subtitle.boundingBox())!.y).toBeGreaterThan((await title.boundingBox())!.y);
    });

    test('el isotipo va arriba del saludo', async ({ page }) => {
      const title = page.getByRole('heading', { level: 1 });
      const markBottom = await title.evaluate((el) => {
        const mark = el.parentElement?.querySelector('svg');
        return mark ? mark.getBoundingClientRect().bottom : null;
      });
      expect(markBottom).not.toBeNull();
      expect(markBottom!).toBeLessThanOrEqual((await title.boundingBox())!.y);
    });

    test('los tags van arriba y el campo abajo, cerca del borde inferior', async ({ page }) => {
      const lastTag = examplesOf(page).getByRole('button', { name: EXAMPLES[3] });
      const tagsBottom = (await lastTag.boundingBox())!;
      const prompt = (await promptOf(page).boundingBox())!;

      expect(prompt.y).toBeGreaterThan(tagsBottom.y + tagsBottom.height);
      expect(prompt.y + prompt.height).toBeGreaterThan(900 * 0.75);
    });

    test('los tags son pills blancas con el ícono de la profesión y llenan el campo sin buscar', async ({
      page,
    }) => {
      const group = examplesOf(page);
      await expect(group.getByRole('button')).toHaveCount(EXAMPLES.length);
      for (const name of EXAMPLES) {
        const tag = group.getByRole('button', { name });
        await expect(tag).toBeVisible();
        await expect(tag.locator('svg')).toHaveCount(1);
        const look = await tag.evaluate((el) => ({
          background: getComputedStyle(el).backgroundColor,
          height: el.getBoundingClientRect().height,
        }));
        expect(look.background).toBe('rgb(255, 255, 255)');
        expect(look.height).toBeGreaterThanOrEqual(40);
      }

      await group.getByRole('button', { name: 'Revisar un contrato de arrendamiento' }).click();
      await expect(promptOf(page)).toHaveValue(
        'Quiero revisar un contrato de arrendamiento antes de renovarlo.'
      );
      await expect(promptOf(page)).toBeFocused();
      await expect(page).toHaveURL(/\/match-discovery$/);
      await expect(page.getByRole('heading', { name: 'Resultados' })).toHaveCount(0);
    });

    test('el campo solo tiene el micrófono y la flecha de enviar', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Buscar profesionales' })).toBeVisible();
      await expect(page.getByText('para buscar', { exact: true })).toHaveCount(0);

      // A lo sumo el micrófono (si el navegador dicta) y la flecha.
      const composerButtons = await promptOf(page).evaluate((field) =>
        Array.from(field.parentElement?.querySelectorAll('button') ?? []).map((b) =>
          b.getAttribute('aria-label')
        )
      );
      expect(composerButtons.filter((name) => name !== 'Dictar')).toEqual(['Buscar profesionales']);
    });

    test('el placeholder del campo tiene contraste suficiente sobre blanco', async ({ page }) => {
      const color = await promptOf(page).evaluate(
        (el) => getComputedStyle(el, '::placeholder').color
      );
      // `sage-500` (#707470): 4,8:1 sobre blanco.
      expect(color).toBe('rgb(112, 116, 112)');
    });

    test('el fondo es un brillo de verde campo a toda la pantalla y se ve detrás de la barra de arriba', async ({
      page,
    }) => {
      const glow = await page.evaluate(() => {
        // La capa decorativa: oculta al lector de pantalla, fija y con el degradado en su primer hijo.
        const layer = Array.from(document.querySelectorAll('[aria-hidden="true"]')).find(
          (el) =>
            getComputedStyle(el).position === 'fixed' &&
            el.firstElementChild instanceof HTMLElement &&
            getComputedStyle(el.firstElementChild).backgroundImage.includes('radial-gradient')
        );
        if (!layer) return null;
        const rect = layer.getBoundingClientRect();
        return {
          image: getComputedStyle(layer.firstElementChild!).backgroundImage,
          pointerEvents: getComputedStyle(layer).pointerEvents,
          // De borde a borde; a la derecha solo queda afuera el hueco reservado para la barra de scroll
          // (`scrollbar-gutter: stable`, hasta 20px según el navegador).
          coversWidth: rect.left <= 0 && rect.right >= window.innerWidth - 20,
          coversHeight: rect.top <= 0 && rect.bottom >= window.innerHeight - 1,
        };
      });
      expect(glow).not.toBeNull();
      expect(glow!.image).toContain('radial-gradient');
      expect(glow!.image).toContain('linear-gradient');
      expect(glow!.pointerEvents).toBe('none');
      expect(glow!.coversWidth).toBe(true);
      expect(glow!.coversHeight).toBe(true);

      const headerBackground = await page
        .getByRole('banner')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(headerBackground).toBe('rgba(0, 0, 0, 0)');
    });

    test('con los resultados, la barra de arriba vuelve a tener fondo', async ({ page }) => {
      await promptOf(page).fill('Busco un abogado para revisar un contrato de arrendamiento');
      await page.getByRole('button', { name: 'Buscar profesionales' }).click();
      await expect(page.getByText('Buscaste')).toBeVisible();

      const headerBackground = await page
        .getByRole('banner')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(headerBackground).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  test.describe('en celular', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('el saludo, los tags y el campo entran sin scroll horizontal', async ({ page }) => {
      await page.goto('/match-discovery');
      await expect(promptOf(page)).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(examplesOf(page).getByRole('button', { name: EXAMPLES[3] })).toBeVisible();
    });
  });
});
