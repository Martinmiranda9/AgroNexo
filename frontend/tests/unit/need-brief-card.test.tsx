import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NeedBriefCard from '@/ui/components/NeedBriefCard';
import { initialsOfName, needBriefTags } from '@/ui/components/need-brief-card.logic';
import type { NeedBrief } from '@/shared/types/need-brief';

const BRIEF: NeedBrief = {
  summary: 'Productor de Berrotarán, 350 ha de soja, necesita ayuda con retenciones, este mes.',
  placeLabel: 'Berrotarán, Córdoba',
  hectares: 350,
  urgency: 'ThisWeek',
  topics: ['farm-taxes'],
  crops: ['soybean'],
};

describe('needBriefTags', () => {
  it('lists urgency, place, hectares, crops and topics in that order', () => {
    expect(needBriefTags(BRIEF).map((tag) => tag.label)).toEqual([
      'Urgente',
      'Berrotarán, Córdoba',
      '350 ha',
      'Soja',
      'Impuestos agropecuarios',
    ]);
  });

  it('marks urgency as an alert (never the error color) and hectares as figures', () => {
    const tags = needBriefTags(BRIEF);

    expect(tags.find((tag) => tag.key === 'urgency')?.variant).toBe('alert');
    expect(tags.find((tag) => tag.key === 'hectares')?.mono).toBe(true);
  });

  it('shows "Este mes" as a neutral tag', () => {
    const [tag] = needBriefTags({ ...BRIEF, urgency: 'ThisMonth' });

    expect(tag).toMatchObject({ label: 'Este mes', variant: 'neutral' });
  });

  it('skips what is missing and ids the catalog does not know', () => {
    const tags = needBriefTags({
      summary: 'Productor de Córdoba.',
      topics: ['tema-de-un-catalogo-mas-nuevo'],
      crops: ['quinoa'],
    });

    expect(tags).toEqual([]);
  });

  it('formats large hectares the Argentine way', () => {
    expect(
      needBriefTags({ ...BRIEF, hectares: 1200 }).find((t) => t.key === 'hectares')?.label
    ).toBe('1.200 ha');
  });
});

describe('initialsOfName', () => {
  it('takes the first letters of the first two words', () => {
    expect(initialsOfName('Esteban Bauer')).toBe('EB');
    expect(initialsOfName('  maría  ')).toBe('M');
    expect(initialsOfName('')).toBe('AN');
  });
});

describe('NeedBriefCard', () => {
  it('renders who asks, the brief text, the status and every tag', () => {
    render(
      <NeedBriefCard
        counterpartName="Esteban Bauer"
        counterpartCaption="Productor"
        requestedAt="hace 2 días"
        brief={BRIEF}
        statusLabel="Pendiente"
      />
    );

    expect(screen.getByText('Esteban Bauer')).toBeTruthy();
    expect(screen.getByText('Productor · hace 2 días')).toBeTruthy();
    expect(screen.getByText(BRIEF.summary)).toBeTruthy();
    expect(screen.getByText('Pendiente')).toBeTruthy();

    const tags = within(screen.getByRole('list', { name: 'Datos del pedido' })).getAllByRole(
      'listitem'
    );
    expect(tags.map((tag) => tag.textContent)).toEqual([
      'Urgente',
      'Berrotarán, Córdoba',
      '350 ha',
      'Soja',
      'Impuestos agropecuarios',
    ]);
  });

  it('renders the footer slot for the actions', () => {
    render(
      <NeedBriefCard
        counterpartName="Esteban Bauer"
        brief={BRIEF}
        footer={<button type="button">Aceptar</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeTruthy();
  });

  it('shows the text as plain text, never as HTML', () => {
    const { container } = render(
      <NeedBriefCard
        counterpartName="Esteban Bauer"
        brief={{ ...BRIEF, summary: 'Hola <img src=x onerror=alert(1)> necesito ayuda' }}
      />
    );

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText(/Hola <img src=x/)).toBeTruthy();
  });

  it('omits the tag list when there is nothing to highlight', () => {
    render(
      <NeedBriefCard
        counterpartName="Esteban Bauer"
        brief={{ summary: 'Productor de Córdoba.', topics: [], crops: [] }}
      />
    );

    expect(screen.queryByRole('list', { name: 'Datos del pedido' })).toBeNull();
  });
});
