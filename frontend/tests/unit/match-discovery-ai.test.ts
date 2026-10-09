import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NEED_RESPONSE_SCHEMA,
  buildSystemInstruction,
  toInterpretation,
} from '@/features/match-discovery/lib/ai-interpretation';
import { NEED_TOPICS } from '@/features/match-discovery/config/catalog';
import { interpretNeed } from '@/features/match-discovery/lib/interpret-need';
import { interpretNeedWithAiAction } from '@/features/match-discovery/server/interpret-need.action';

vi.mock('@/features/match-discovery/server/interpret-need.action', () => ({
  interpretNeedWithAiAction: vi.fn(),
}));

const TEXT = 'Busco contador para mi campo de 40 hectáreas en Berrotarán';

describe('toInterpretation', () => {
  it('accepts a valid model response (object or JSON text)', () => {
    const raw = {
      role: 'Accountant',
      topics: ['farm-taxes'],
      activity: 'Agricultura',
      urgency: 'Este mes',
    };

    const need = toInterpretation(JSON.stringify(raw), TEXT, null);

    expect(need).toEqual({
      text: TEXT,
      role: 'Accountant',
      topics: ['farm-taxes'],
      activity: 'Agricultura',
      hectares: null,
      urgency: 'Este mes',
      place: null,
      crops: [],
    });
    expect(toInterpretation(raw, TEXT, null)).toEqual(need);
  });

  it('drops values that are not in the catalog instead of trusting the model', () => {
    const need = toInterpretation(
      {
        role: 'Doctor',
        topics: ['farm-taxes', 'hack-the-planet'],
        activity: 'Minería',
        urgency: 'ya',
      },
      TEXT,
      null
    );

    // El rol inválido se deduce del tema válido; lo demás se descarta.
    expect(need).toMatchObject({
      role: 'Accountant',
      topics: ['farm-taxes'],
      activity: null,
      urgency: null,
    });
  });

  it('removes topics that belong to another profession than the chosen one', () => {
    const need = toInterpretation(
      { role: 'Accountant', topics: ['farm-taxes', 'farm-leases'] },
      TEXT,
      null
    );

    expect(need?.topics).toEqual(['farm-taxes']);
  });

  it('prefers the explicit number read from the text over the model hectares', () => {
    expect(toInterpretation({ topics: [], hectares: 400 }, TEXT, 40)?.hectares).toBe(40);
    expect(toInterpretation({ topics: [], hectares: 400.4 }, TEXT, null)?.hectares).toBe(400);
  });

  it('keeps the place the farmer named, trimmed, and drops empty or absurd ones', () => {
    expect(toInterpretation({ topics: [], place: '  Río   Cuarto ' }, TEXT, null)?.place).toBe(
      'Río Cuarto'
    );
    expect(toInterpretation({ topics: [], place: '   ' }, TEXT, null)?.place).toBeNull();
    expect(toInterpretation({ topics: [] }, TEXT, null)?.place).toBeNull();
    expect(toInterpretation({ topics: [], place: 'x'.repeat(200) }, TEXT, null)?.place).toBeNull();
  });

  it('keeps only crops from the catalog, without repeats', () => {
    const need = toInterpretation(
      { topics: [], crops: ['soybean', 'soybean', 'quinoa', 'corn'] },
      TEXT,
      null
    );

    expect(need?.crops).toEqual(['soybean', 'corn']);
  });

  it('discards absurd hectares', () => {
    expect(toInterpretation({ topics: [], hectares: -5 }, TEXT, null)?.hectares).toBeNull();
    expect(toInterpretation({ topics: [], hectares: 9e9 }, TEXT, null)?.hectares).toBeNull();
  });

  it('returns null when there is nothing usable', () => {
    expect(toInterpretation('no es json', TEXT, null)).toBeNull();
    expect(toInterpretation(null, TEXT, null)).toBeNull();
    expect(toInterpretation([], TEXT, null)).toBeNull();
    expect(toInterpretation(undefined, TEXT, null)).toBeNull();
  });
});

describe('prompt and schema', () => {
  it('lists every catalog topic in the instructions and in the response schema', () => {
    const instruction = buildSystemInstruction();

    for (const topic of NEED_TOPICS) {
      expect(instruction).toContain(topic.id);
      expect(NEED_RESPONSE_SCHEMA.properties.topics.items.enum).toContain(topic.id);
    }
  });
});

describe('interpretNeed', () => {
  beforeEach(() => {
    vi.mocked(interpretNeedWithAiAction).mockReset();
  });

  it('uses the AI interpretation when it answers', async () => {
    const fromAi = {
      text: TEXT,
      role: 'Lawyer' as const,
      topics: [],
      activity: null,
      hectares: 40,
      urgency: null,
      place: null,
      crops: [],
    };
    vi.mocked(interpretNeedWithAiAction).mockResolvedValue(fromAi);

    expect(await interpretNeed(TEXT)).toBe(fromAi);
    expect(interpretNeedWithAiAction).toHaveBeenCalledWith(TEXT, 40);
  });

  it('falls back to the local interpreter when the AI returns nothing', async () => {
    vi.mocked(interpretNeedWithAiAction).mockResolvedValue(null);

    expect(await interpretNeed(TEXT)).toMatchObject({ role: 'Accountant', hectares: 40 });
  });

  it('falls back to the local interpreter when the AI call throws', async () => {
    vi.mocked(interpretNeedWithAiAction).mockRejectedValue(new Error('network'));

    expect(await interpretNeed(TEXT)).toMatchObject({ role: 'Accountant', hectares: 40 });
  });
});
