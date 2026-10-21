import { test, expect, type Page } from '@playwright/test';

/**
 * Rendimiento: cada pantalla baja solo las librerías que usa, la fuente se precarga una sola vez y tipear no
 * re-renderiza lo que no cambia.
 *
 * Las pantallas públicas corren sin sesión ni backend. Las autenticadas necesitan `E2E_SESSION_TOKEN` (ID token de
 * Firebase de un usuario de prueba ya registrado; Buscar, de un productor) y la API levantada; sin el token se saltean.
 * Mide en `npm run dev`: los renders se cuentan con un hook de React DevTools, que solo existe en desarrollo.
 */

const SESSION_TOKEN = process.env.E2E_SESSION_TOKEN;

// Estos tests esperan a que la red quede quieta y leen todo el código bajado: en dev, con el compilado en frío, pasan
// de los 30 s por defecto.
test.describe.configure({ timeout: 90_000 });

/** Marcas que deja cada librería pesada en el código que baja el navegador (los chunks de desarrollo nombran sus módulos). */
const HEAVY_LIBRARIES = {
  firebase: /node_modules[\\/]@firebase[\\/]auth/,
  recharts: /node_modules[\\/]recharts[\\/]/,
  phone: /node_modules[\\/](libphonenumber-js|country-flag-icons)[\\/]/,
} as const;

type Library = keyof typeof HEAVY_LIBRARIES;

/** Junta el código de todos los scripts que baja la página hasta quedar quieta. */
async function loadedScripts(page: Page, path: string): Promise<string> {
  const bodies: Promise<string>[] = [];
  page.on('response', (response) => {
    if (response.request().resourceType() === 'script') {
      bodies.push(response.text().catch(() => ''));
    }
  });
  await page.goto(path, { waitUntil: 'networkidle' });
  return (await Promise.all(bodies)).join('\n');
}

const includes = (code: string, library: Library) => HEAVY_LIBRARIES[library].test(code);

/**
 * Hook mínimo de React DevTools: cuenta qué componentes se renderizaron en cada commit mientras está prendido.
 * Un componente cuenta si React lo ejecutó en ese render (flag `PerformedWork` y empezó después del commit anterior).
 */
function installRenderCounter() {
  const counts = new Map<string, number>();
  let last = 0;
  const nameOf = (type: any): string =>
    type?.displayName ||
    type?.name ||
    type?.render?.displayName ||
    type?.render?.name ||
    type?.type?.displayName ||
    type?.type?.name ||
    'Anonymous';
  const walk = (fiber: any, since: number) => {
    while (fiber) {
      const isComponent = [0, 1, 11, 14, 15].includes(fiber.tag);
      if (isComponent && (fiber.flags & 1) === 1 && fiber.actualStartTime > since) {
        const name = nameOf(fiber.type);
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
      if (fiber.child) walk(fiber.child, since);
      fiber = fiber.sibling;
    }
  };
  const w = window as any;
  w.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    renderers: new Map(),
    inject: () => 1,
    checkDCE: () => {},
    onScheduleFiberRoot: () => {},
    onCommitFiberUnmount: () => {},
    onPostCommitFiberRoot: () => {},
    onCommitFiberRoot: (_id: number, root: any) => {
      if (w.__renders.on) walk(root.current.child, last);
      last = performance.now();
    },
  };
  w.__renders = {
    on: false,
    start() {
      counts.clear();
      this.on = true;
    },
    stop() {
      this.on = false;
      return Object.fromEntries(counts);
    },
  };
}

/** Tipea en el campo y devuelve cuántas veces se renderizó cada componente mientras tanto. */
async function rendersWhileTyping(page: Page, field: ReturnType<Page['getByLabel']>, text: string) {
  await field.click();
  await page.evaluate(() => (window as any).__renders.start());
  await field.pressSequentially(text, { delay: 20 });
  await page.waitForTimeout(300);
  return (await page.evaluate(() => (window as any).__renders.stop())) as Record<string, number>;
}

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

test.describe('Rendimiento de las pantallas públicas', () => {
  test('la página de "no encontrado" no baja Firebase, recharts ni la librería de teléfonos', async ({
    page,
  }) => {
    const code = await loadedScripts(page, '/esta-pagina-no-existe');
    await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();

    expect(includes(code, 'firebase')).toBe(false);
    expect(includes(code, 'recharts')).toBe(false);
    expect(includes(code, 'phone')).toBe(false);
  });

  test('el login baja Firebase para ingresar, pero no recharts ni la librería de teléfonos', async ({
    page,
  }) => {
    const code = await loadedScripts(page, '/login');
    await expect(page.getByRole('heading', { name: 'Bienvenido a AgroNexo' })).toBeVisible();

    expect(includes(code, 'firebase')).toBe(true);
    expect(includes(code, 'recharts')).toBe(false);
    expect(includes(code, 'phone')).toBe(false);
  });

  test('se precarga un solo archivo de fuente: Inter normal, sin itálica ni la mono', async ({
    page,
  }) => {
    await page.goto('/login');
    const preloadedFonts = page.locator('link[rel="preload"][as="font"]');
    await expect(preloadedFonts).toHaveCount(1);

    const italic = await page.evaluate(() =>
      [...document.fonts].some((font) => font.family.includes('Inter') && font.style === 'italic')
    );
    expect(italic).toBe(false);
  });

  test.describe('al tipear el correo', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('en el login se re-renderiza solo el campo, no la pantalla ni el panel de marca', async ({
      page,
    }) => {
      await page.addInitScript(installRenderCounter);
      await page.goto('/login', { waitUntil: 'networkidle' });

      const text = 'productor.prueba@example.com';
      const renders = await rendersWhileTyping(page, page.getByLabel('Correo'), text);

      expect(renders.LoginEmailField).toBeGreaterThan(0);
      expect(renders.AgroNexoAuthModal ?? 0).toBe(0);
      expect(renders.BrandShowcasePanel ?? 0).toBe(0);
      expect(renders.GoogleButton ?? 0).toBe(0);
      await expect(page.getByLabel('Correo')).toHaveValue(text);
    });

    test('en el registro no se re-renderizan los campos de contraseña', async ({ page }) => {
      await page.addInitScript(installRenderCounter);
      await page.goto('/onboarding', { waitUntil: 'networkidle' });

      const text = 'productor.prueba@example.com';
      const renders = await rendersWhileTyping(page, page.getByLabel('Correo'), text);

      expect(renders.AccountStep).toBeGreaterThan(0);
      expect(renders.PasswordField ?? 0).toBe(0);
      await expect(page.getByLabel('Correo')).toHaveValue(text);
    });
  });
});

test.describe('Rendimiento de las pantallas con sesión', () => {
  test.skip(!SESSION_TOKEN, 'Requiere E2E_SESSION_TOKEN (ID token de Firebase) y la API levantada');
  test.use({ viewport: { width: 1440, height: 900 } });

  test('el marco no baja Firebase hasta cerrar sesión', async ({ page }) => {
    await signIn(page);
    const code = await loadedScripts(page, '/farms');
    await expect(page.getByRole('complementary', { name: 'Barra lateral' })).toBeVisible();

    expect(includes(code, 'firebase')).toBe(false);
    expect(includes(code, 'phone')).toBe(false);
  });

  test('la lista de solicitudes no baja recharts', async ({ page }) => {
    await signIn(page);
    const code = await loadedScripts(page, '/matches');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    expect(includes(code, 'recharts')).toBe(false);
  });

  test('en el tablero del campo, el gráfico de labores llega aparte y se ve', async ({ page }) => {
    await signIn(page);
    await page.goto('/farms');
    const farmLink = page
      .getByRole('main')
      .getByRole('link')
      .filter({ hasNotText: /^Campos$/ })
      .first();
    test.skip(!(await farmLink.isVisible()), 'El usuario de prueba no tiene campos');

    const chartChunk = page.waitForResponse(
      async (response) =>
        response.request().resourceType() === 'script' &&
        HEAVY_LIBRARIES.recharts.test(await response.text().catch(() => ''))
    );
    await farmLink.click();
    await expect(page).toHaveURL(/\/farms\/[^/]+$/);

    await expect(page.getByRole('heading', { name: 'Avance de labores' })).toBeVisible();
    expect((await chartChunk).ok()).toBe(true);
  });

  test('en Buscar, tipear el pedido no re-renderiza el encabezado ni el sidebar', async ({
    page,
  }) => {
    await page.addInitScript(installRenderCounter);
    await signIn(page);
    await page.goto('/match-discovery', { waitUntil: 'networkidle' });

    const prompt = page.getByRole('textbox', { name: '¿Qué necesitás?' });
    const renders = await rendersWhileTyping(page, prompt, 'Agrónomo para la fina');

    expect(renders.MatchDiscoveryScreen).toBeGreaterThan(0);
    expect(renders.AppHeader ?? 0).toBe(0);
    expect(renders.DesktopSidebar ?? 0).toBe(0);
    expect(renders.AppSidebar ?? 0).toBe(0);
  });
});
