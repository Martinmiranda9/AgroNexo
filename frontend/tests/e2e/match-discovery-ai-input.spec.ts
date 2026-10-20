import { test, expect, type Page } from '@playwright/test';

/**
 * Buscar profesionales con los componentes de Cashmere: el campo para contar la necesidad es el AI Agent Input (Enter o
 * la flecha buscan, Shift + Enter hace un salto de línea; el dictado es solo el ícono del micrófono). El saludo y el
 * resto de la entrada los cubre `match-discovery-hero.spec.ts`.
 *
 * Necesita una sesión real: `E2E_SESSION_TOKEN` con un ID token de Firebase de un productor ya registrado, y la API
 * levantada (NEXT_PUBLIC_API_URL). Sin el token, los tests se saltean.
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

const promptOf = (page: Page) => page.getByRole('textbox', { name: '¿Qué necesitás?' });
const searchButtonOf = (page: Page) => page.getByRole('button', { name: 'Buscar profesionales' });

test.describe('Buscar profesionales con el AI Agent Input', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto('/match-discovery');
    await expect(promptOf(page)).toBeVisible();
  });

  test('la flecha se habilita recién con una necesidad de al menos 4 caracteres', async ({
    page,
  }) => {
    const search = searchButtonOf(page);
    await expect(search).toHaveAttribute('aria-disabled', 'true');

    await promptOf(page).fill('abc');
    await expect(page.getByText('Escribí al menos 4 caracteres para buscar.')).toBeVisible();
    await expect(search).toHaveAttribute('aria-disabled', 'true');

    await promptOf(page).fill('Necesito un agrónomo');
    await expect(search).toHaveAttribute('aria-disabled', 'false');
  });

  test('Shift + Enter hace un salto de línea y no busca', async ({ page }) => {
    const prompt = promptOf(page);
    await prompt.fill('Necesito un contador');
    await prompt.press('Shift+Enter');
    await prompt.pressSequentially('para retenciones');

    await expect(prompt).toHaveValue('Necesito un contador\npara retenciones');
    await expect(page).toHaveURL(/\/match-discovery$/);
    await expect(page.getByRole('heading', { name: 'Resultados' })).toHaveCount(0);
  });

  test('un ejemplo llena el campo y Enter busca profesionales', async ({ page }) => {
    await page.getByRole('button', { name: 'Contador para retenciones de granos' }).click();
    const prompt = promptOf(page);
    await expect(prompt).toHaveValue(/retenciones y liquidación de granos/);
    await expect(prompt).toBeFocused();

    // La búsqueda corre como acción del servidor sobre la misma página.
    const searched = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' && new URL(res.url()).pathname === '/match-discovery'
    );
    await prompt.press('Enter');
    expect((await searched).status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Resultados' })).toBeAttached();
  });

  test('el dictado es solo el ícono del micrófono', async ({ page }) => {
    const mic = page.getByRole('button', { name: 'Dictar' });
    // El micrófono aparece después de montar, cuando la pantalla detecta el reconocimiento de voz.
    const supported = await mic
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!supported, 'Este navegador no tiene reconocimiento de voz');

    await expect(mic).toHaveText('');
    await expect(mic).toHaveAttribute('aria-pressed', 'false');
  });

  test('la flecha también busca', async ({ page }) => {
    await promptOf(page).fill('Busco un abogado para revisar un contrato de arrendamiento');
    await searchButtonOf(page).click();
    await expect(page.getByRole('heading', { name: 'Resultados' })).toBeAttached();
  });
});
