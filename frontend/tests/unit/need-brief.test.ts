import { describe, expect, it } from 'vitest';
import { interpretNeedLocally } from '@/features/match-discovery/lib/interpret-need';
import {
  briefUserInput,
  buildNeedBrief,
  draftSummary,
  isValidSummary,
  toBriefSummary,
} from '@/features/match-discovery/lib/need-brief';

const need = (text: string) => interpretNeedLocally(text);

describe('draftSummary', () => {
  it('builds the example brief: place, land with crops, what they need and when', () => {
    const summary = draftSummary(
      need('Busco contador para retenciones, tengo 350 ha de soja, es para este mes'),
      'Berrotarán, Córdoba'
    );

    expect(summary).toBe(
      'Productor de Berrotarán, 350 ha de soja, necesita ayuda con impuestos agropecuarios, este mes.'
    );
  });

  it('joins several crops and topics in natural Spanish', () => {
    const summary = draftSummary(
      need(
        'Necesito un contador para retenciones y liquidación de granos, 1.200 hectáreas de soja y maíz'
      ),
      'Río Cuarto, Córdoba'
    );

    expect(summary).toContain('1.200 ha de soja y maíz');
    expect(summary).toContain('impuestos agropecuarios y liquidación de granos');
  });

  it('falls back to the profession when no topic was detected, and to "profesional" when nothing was', () => {
    expect(draftSummary(need('Necesito un abogado'), 'Villa María, Córdoba')).toBe(
      'Productor de Villa María, busca un abogado.'
    );
    expect(draftSummary(need('Necesito ayuda'), 'Córdoba')).toBe(
      'Productor de Córdoba, busca un profesional.'
    );
  });

  it('mentions the crops even without hectares', () => {
    expect(draftSummary(need('Busco agrónomo para trigo'), 'Rosario, Santa Fe')).toBe(
      'Productor de Rosario, con trigo, necesita ayuda con cultivos extensivos.'
    );
  });

  it('always yields something the backend accepts', () => {
    expect(isValidSummary(draftSummary(need('hola'), 'X'))).toBe(true);
  });
});

describe('buildNeedBrief', () => {
  it('packs the search into the backend shape, translating the urgency to the enum', () => {
    const brief = buildNeedBrief(
      need('Busco contador para retenciones, 350 ha de soja, urgente'),
      'Berrotarán, Córdoba',
      '  Productor de Berrotarán, 350 ha de soja.  '
    );

    expect(brief).toEqual({
      summary: 'Productor de Berrotarán, 350 ha de soja.',
      placeLabel: 'Berrotarán, Córdoba',
      hectares: 350,
      urgency: 'ThisWeek',
      topics: ['farm-taxes'],
      crops: ['soybean'],
    });
  });

  it('leaves urgency and hectares empty when the farmer did not say them', () => {
    const brief = buildNeedBrief(need('Necesito un abogado'), 'Córdoba', 'Productor de Córdoba.');

    expect(brief).toMatchObject({ hectares: null, urgency: null, topics: [], crops: [] });
  });
});

describe('isValidSummary', () => {
  it('requires between 10 and 600 characters once trimmed', () => {
    expect(isValidSummary('corto')).toBe(false);
    expect(isValidSummary('         x          ')).toBe(false);
    expect(isValidSummary('Productor de Córdoba.')).toBe(true);
    expect(isValidSummary('a'.repeat(601))).toBe(false);
  });
});

describe('toBriefSummary (what Gemini returns)', () => {
  it('accepts a clean summary, from JSON text or an object', () => {
    const summary =
      'Productor de Berrotarán, 350 ha de soja, necesita ayuda con retenciones, este mes.';

    expect(toBriefSummary(JSON.stringify({ summary }))).toBe(summary);
    expect(toBriefSummary({ summary: `  ${summary}  ` })).toBe(summary);
  });

  it('rejects empty, too short, too long or malformed answers', () => {
    expect(toBriefSummary('no es json')).toBeNull();
    expect(toBriefSummary(null)).toBeNull();
    expect(toBriefSummary({})).toBeNull();
    expect(toBriefSummary({ summary: 'corto' })).toBeNull();
    expect(toBriefSummary({ summary: 'a'.repeat(300) })).toBeNull();
    expect(toBriefSummary({ summary: 42 })).toBeNull();
  });

  it.each([
    ['an email', 'Productor de Berrotarán, escribir a juan@correo.com por retenciones.'],
    ['a link', 'Productor de Berrotarán, ver https://ejemplo.com para más datos del campo.'],
    ['a phone number', 'Productor de Berrotarán, llamar al 351 555 1234 por retenciones.'],
    [
      'an international phone',
      'Productor de Berrotarán, WhatsApp +54 9 351 555-1234 por retenciones.',
    ],
  ])('rejects a summary that leaks contact data (%s)', (_label, summary) => {
    expect(toBriefSummary({ summary })).toBeNull();
  });

  it('does not mistake hectares for a phone number', () => {
    expect(
      toBriefSummary({
        summary: 'Productor de Berrotarán, 1.200 ha de soja, necesita un contador.',
      })
    ).not.toBeNull();
  });
});

describe('briefUserInput', () => {
  it('hands the model the facts as labelled data, with catalog labels instead of ids', () => {
    const input = JSON.parse(
      briefUserInput(need('Busco contador para retenciones, 350 ha de soja'), 'Berrotarán, Córdoba')
    );

    expect(input).toMatchObject({
      zona: 'Berrotarán, Córdoba',
      profesion: 'Contador',
      temas: ['Impuestos agropecuarios'],
      cultivos: ['Soja'],
      hectareas: 350,
    });
  });
});
