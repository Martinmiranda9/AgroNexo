import { describe, expect, it } from 'vitest';
import { buildRegisterRequest } from '@/features/onboarding/lib/build-request';
import type { FormValues } from '@/features/onboarding/config/types';

const base: FormValues = {
  firstName: 'Laura',
  lastName: 'Gómez',
  documentNumber: '30111222',
  phoneNumber: '+5493511234567',
  specialty: 'Suelos',
  licenseNumber: '27512',
  yearsExperience: '10',
  maxCapacity: '5',
  coverageRadius: '25',
  country: 'Argentina',
  countryCode: 'AR',
  province: 'Córdoba',
  provinceCode: 'X',
  city: '',
};

/** Centro del polígono = promedio de los vértices (el círculo es simétrico). */
function center(coords: { latitude: number; longitude: number }[]) {
  const n = coords.length;
  return {
    latitude: coords.reduce((s, c) => s + c.latitude, 0) / n,
    longitude: coords.reduce((s, c) => s + c.longitude, 0) / n,
  };
}

describe('buildRegisterRequest · cobertura del profesional', () => {
  it('centra el radio en la ciudad elegida', async () => {
    const req = await buildRegisterRequest('agronomist', { ...base, city: 'Río Cuarto' });
    const c = center(req.coverageAreaCoordinates!);
    expect(c.latitude).toBeCloseTo(-33.13, 1); // Río Cuarto, no el centro de Córdoba (-31.40)
    expect(c.longitude).toBeCloseTo(-64.35, 1);
  });

  it('sin ciudad centra el radio en la provincia', async () => {
    const req = await buildRegisterRequest('agronomist', base);
    const c = center(req.coverageAreaCoordinates!);
    expect(c.latitude).toBeCloseTo(-31.4, 1);
  });

  it('una ciudad que no existe en la provincia cae al centro de la provincia', async () => {
    const req = await buildRegisterRequest('agronomist', { ...base, city: 'Ciudad Inexistente' });
    const c = center(req.coverageAreaCoordinates!);
    expect(c.latitude).toBeCloseTo(-31.4, 1);
  });

  it('sin provincia no arma cobertura (profesional remoto)', async () => {
    const req = await buildRegisterRequest('accountant', { ...base, province: '', provinceCode: '' });
    expect(req.coverageAreaCoordinates).toBeUndefined();
  });
});
