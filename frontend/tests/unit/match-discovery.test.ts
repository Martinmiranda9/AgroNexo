import { describe, expect, it } from 'vitest';
import type { MatchRecommendation } from '@/core/models/match.model';
import { getSampleDiscovery } from '@/features/match-discovery/data/sample-professionals';
import { buildResults, MAX_RESULTS } from '@/features/match-discovery/lib/build-results';
import { interpretNeedLocally } from '@/features/match-discovery/lib/interpret-need';

const recommendation = (overrides: Partial<MatchRecommendation>): MatchRecommendation => ({
  id: 'r1',
  professionalId: 'p1',
  firstName: 'Ana',
  lastName: 'Paz',
  role: 'Accountant',
  specialty: 'Impuestos agropecuarios',
  yearsExperience: 9,
  isVerified: true,
  maxCapacity: 10,
  activeMatches: 2,
  distanceKm: 0,
  score: 0.9,
  rankPosition: 1,
  ...overrides,
});

describe('interpretNeedLocally', () => {
  it('detects role, topics, hectares and activity from a farmer sentence', () => {
    const need = interpretNeedLocally(
      'Necesito un contador que entienda de retenciones y liquidación de granos. Tengo 350 ha de soja.'
    );

    expect(need.role).toBe('Accountant');
    expect(need.topics).toEqual(['farm-taxes', 'grain-settlement']);
    expect(need.hectares).toBe(350);
    expect(need.activity).toBe('Agricultura');
  });

  it('detects the crops named in the sentence as whole words', () => {
    expect(interpretNeedLocally('Tengo 350 ha de soja y maíz').crops).toEqual(['soybean', 'corn']);
    expect(interpretNeedLocally('Siembro maní en Berrotarán').crops).toEqual(['peanut']);
    // "mani" no es el cultivo cuando es parte de otra palabra
    expect(interpretNeedLocally('Necesito un manifiesto de carga').crops).toEqual([]);
    expect(interpretNeedLocally('Necesito ayuda con mi campo').crops).toEqual([]);
  });

  it('infers the role from the topic when no profession is named', () => {
    expect(
      interpretNeedLocally('Quiero revisar un contrato de arrendamiento antes de renovarlo').role
    ).toBe('Lawyer');
    expect(
      interpretNeedLocally('Busco ajustar la fertilización por ambientes en la fina').role
    ).toBe('Agronomist');
  });

  it('reads thousands separators and urgency', () => {
    const need = interpretNeedLocally('Necesito un agrónomo urgente para 1.200 hectáreas');

    expect(need.hectares).toBe(1200);
    expect(need.urgency).toBe('Esta semana');
  });

  it('does not match short keywords inside other words ("iva" in "activa")', () => {
    expect(interpretNeedLocally('Mi sociedad está activa y quiero crecer').topics).not.toContain(
      'farm-taxes'
    );
  });

  it('returns no role for a vague request', () => {
    const need = interpretNeedLocally('Necesito ayuda con mi campo');

    expect(need.role).toBeNull();
    expect(need.topics).toEqual([]);
  });
});

describe('buildResults', () => {
  const taxes = interpretNeedLocally('Necesito un contador para impuestos');

  it('keeps only the requested role', () => {
    const results = buildResults(
      [
        recommendation({ id: 'a' }),
        recommendation({ id: 'b', role: 'Lawyer', specialty: 'Sucesiones' }),
      ],
      taxes
    );

    expect(results.map((r) => r.recommendation.id)).toEqual(['a']);
  });

  it('puts the ones that fit before the ones that might, keeping the backend order inside each group', () => {
    const results = buildResults(
      [
        recommendation({ id: 'wrong-topic', rankPosition: 1, specialty: 'Créditos y garantías' }),
        recommendation({ id: 'fits-late', rankPosition: 3 }),
        recommendation({ id: 'fits-early', rankPosition: 2 }),
      ],
      taxes
    );

    expect(results.map((r) => [r.recommendation.id, r.fit])).toEqual([
      ['fits-early', 'fits'],
      ['fits-late', 'fits'],
      ['wrong-topic', 'maybe'],
    ]);
  });

  it('flags full capacity and missing verification under "falta validar" and never as a fit', () => {
    const [result] = buildResults(
      [recommendation({ activeMatches: 10, maxCapacity: 10, isVerified: false })],
      taxes
    );

    expect(result.fit).toBe('maybe');
    expect(result.missing).toEqual(
      expect.arrayContaining([
        'no tiene cupo para clientes nuevos ahora',
        'su matrícula todavía no está verificada',
      ])
    );
  });

  it('explains distance only for roles that need to reach the field', () => {
    const agro = interpretNeedLocally('Busco un agrónomo para la fina');
    const [near] = buildResults(
      [recommendation({ role: 'Agronomist', specialty: 'Cultivos extensivos', distanceKm: 0 })],
      agro
    );
    const [far] = buildResults(
      [recommendation({ role: 'Agronomist', specialty: 'Cultivos extensivos', distanceKm: 130 })],
      agro
    );
    const [remote] = buildResults([recommendation({ distanceKm: 500 })], taxes);

    expect(near.checks).toContain('Cubre la zona de tu campo');
    expect(far.missing).toContain('su zona de cobertura no incluye tu campo');
    expect(far.fit).toBe('maybe');
    expect(remote.checks).toContain('Está a 500 km de tu campo y trabaja a distancia');
    expect(remote.fit).toBe('fits');
  });

  it('describes the distance to the searched zone for every role, naming the place when the farmer chose one', () => {
    const [sameZone] = buildResults([recommendation({ distanceKm: 0 })], taxes);
    const [farRemote] = buildResults(
      [recommendation({ distanceKm: 557 })],
      taxes,
      'Río Cuarto, Córdoba'
    );
    const agro = interpretNeedLocally('Busco un agrónomo');
    const [field] = buildResults(
      [recommendation({ role: 'Agronomist', specialty: 'Cultivos extensivos', distanceKm: 38 })],
      agro,
      'Río Cuarto, Córdoba'
    );

    expect(sameZone.proximity).toBe('En la zona de tu campo · a distancia');
    expect(sameZone.why).toContain('está en la zona de tu campo y atiende a distancia');
    expect(farRemote.proximity).toBe('A 557 km de Río Cuarto, Córdoba · a distancia');
    expect(field.proximity).toBe('Cubre Río Cuarto, Córdoba (zona centrada a 38 km)');
    expect(field.checks).toContain('Cubre Río Cuarto, Córdoba; su zona centrada a 38 km');
  });

  it('caps the list', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      recommendation({ id: `r${i}`, rankPosition: i + 1 })
    );

    expect(buildResults(many, taxes)).toHaveLength(MAX_RESULTS);
  });
});

describe('sample professionals (development only)', () => {
  it('has at least one professional per searchable role', () => {
    const roles = new Set(
      getSampleDiscovery({
        latitude: 0,
        longitude: 0,
        requiresFieldPresence: false,
      }).recommendations.map((r) => r.role)
    );

    expect([...roles].sort()).toEqual(['Accountant', 'Agronomist', 'Investor', 'Lawyer']);
  });

  it('drops agronomists outside the coverage radius when presence is required', () => {
    const agronomists = getSampleDiscovery({
      latitude: 0,
      longitude: 0,
      requiresFieldPresence: true,
    }).recommendations.filter((r) => r.role === 'Agronomist');

    expect(agronomists.every((r) => r.distanceKm < 100)).toBe(true);
  });
});
