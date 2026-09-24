import { test, expect, type Page } from '@playwright/test';

/**
 * Registro completo de cada tipo de usuario: llena el wizard real del frontend
 * y verifica que el backend responda 201 Created. Requiere la API en :5000.
 */

const personal = (n: number) => ({
  firstName: 'Test',
  lastName: `Usuario${n}`,
  documentNumber: `2030405${n}0`,
  phone: `+54 9 351 555 010${n}`,
});

async function fillPersonal(page: Page, data: ReturnType<typeof personal>) {
  await page.getByLabel('Nombre', { exact: true }).fill(data.firstName);
  await page.getByLabel('Apellido', { exact: true }).fill(data.lastName);
  await page.getByLabel('DNI o CUIT').fill(data.documentNumber);
  await page.getByLabel('WhatsApp').fill(data.phone);
  // La credencial de la derecha refleja el WhatsApp mientras se escribe
  await expect(page.getByText(data.phone)).toBeVisible();
  await page.getByRole('button', { name: /Continuar/ }).click();
}

async function fillProfessional(page: Page, specialty: string, license?: string) {
  if (license) {
    await page.getByLabel('Matrícula').fill(license);
    await expect(page.getByText(`Matrícula ${license}`)).toBeVisible();
  }
  await page.getByLabel('Especialidad').fill(specialty);
  await page.getByLabel('Años de experiencia').fill('8');
  await page.getByLabel('Productores que podés atender').fill('25');
  await page.getByRole('button', { name: /Continuar/ }).click();

  await page.getByLabel('Provincia / Región').selectOption({ label: 'Córdoba' });
  await page.getByLabel('Radio de cobertura').selectOption('100');
}

const flows: { kind: string; index: number; fill: (page: Page) => Promise<void> }[] = [
  {
    kind: 'producer',
    index: 1,
    fill: async (page) => {
      await page.getByLabel('Provincia / Región').selectOption({ label: 'Buenos Aires' });
      await page.getByLabel('Ciudad / Localidad').selectOption({ index: 1 });
      await page.getByRole('button', { name: /Continuar/ }).click();
      await page.getByRole('radio', { name: /Mixto/ }).click();
      await page.getByLabel('Superficie total').selectOption('From100To500');
      await page.getByRole('button', { name: /Continuar/ }).click();
      await page.getByRole('checkbox', { name: 'Abogado' }).click();
      await page.getByRole('checkbox', { name: 'Contador' }).click();
      await expect(page.getByText('Busca: Contador, Abogado')).toBeVisible();
    },
  },
  { kind: 'agronomist', index: 2, fill: (page) => fillProfessional(page, 'Nutrición de suelos', 'MP-1234') },
  { kind: 'accountant', index: 3, fill: (page) => fillProfessional(page, 'Impuestos agropecuarios', 'T123 F45') },
  { kind: 'lawyer', index: 4, fill: (page) => fillProfessional(page, 'Derecho agrario y contratos', 'Tomo 98 Folio 7') },
  { kind: 'investor', index: 5, fill: (page) => fillProfessional(page, 'Financiamiento de campañas') },
];

test.describe('Registro por tipo de usuario → POST /api/v1/identity/register', () => {
  for (const { kind, index, fill } of flows) {
    test(`${kind} se registra y recibe 201 Created`, async ({ page }) => {
      await page.goto(`/onboarding?type=${kind}`);
      await fillPersonal(page, personal(index));

      // Paso de ubicación / perfil según el tipo
      if (kind !== 'producer') await expect(page.getByRole('heading', { name: 'Tu perfil profesional' })).toBeVisible();
      else await expect(page.getByRole('heading', { name: /Dónde está tu establecimiento/ })).toBeVisible();

      await fill(page);

      const registration = page.waitForResponse((r) => r.url().endsWith('/api/v1/identity/register'));
      await page.getByRole('button', { name: 'Crear cuenta' }).click();
      const response = await registration;

      const sent = response.request().postDataJSON();
      const received = await response.json();
      console.log(`\n[${kind}] status=${response.status()}\n  enviado:  ${JSON.stringify({ ...sent, coverageAreaCoordinates: sent.coverageAreaCoordinates ? `${sent.coverageAreaCoordinates.length} vértices` : undefined })}\n  recibido: ${JSON.stringify(received)}`);

      expect(response.status()).toBe(201);
      await expect(page).toHaveURL(/\/welcome\?name=Test/, { timeout: 20_000 });
    });
  }
});
