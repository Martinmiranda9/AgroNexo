import type * as React from 'react';
import { ClockIcon, MapPinIcon } from '@phosphor-icons/react/dist/ssr';
import type { VariantProps } from 'class-variance-authority';
import type { NeedBrief } from '@/shared/types/need-brief';
import { cn } from '@/shared/utils/cn';
import Avatar from './Avatar';
import { Badge, type badgeVariants } from './Badge';
import Card from './Card';
import { initialsOfName, needBriefTags, type NeedTag } from './need-brief-card.logic';

export type NeedBriefBadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export interface NeedBriefCardProps {
  /** Con quién es el pedido: el productor (vista del profesional) o el profesional (vista del productor). */
  counterpartName: string;
  /** Rol de esa persona, bajo el nombre: "Productor". */
  counterpartCaption?: string;
  /** La ficha de necesidad: el texto y los datos que se resaltan como etiquetas. */
  brief: NeedBrief;
  /** Estado del pedido ("Pendiente", "Aceptado"…). */
  statusLabel?: string;
  statusVariant?: NeedBriefBadgeVariant;
  /** Cuándo se pidió, ya formateado: "hace 2 días". */
  requestedAt?: string;
  /** Acciones debajo de la ficha (aceptar/rechazar). */
  footer?: React.ReactNode;
  className?: string;
}

/** Variante del Badge por tipo de etiqueta. "Urgente" va en `warning`: el rojo queda para error y rechazo. */
const TAG_VARIANT: Record<NeedTag['variant'], NeedBriefBadgeVariant> = {
  neutral: 'secondary',
  positive: 'success',
  alert: 'warning',
};

const ICONS = {
  clock: <ClockIcon data-icon="inline-start" weight="bold" aria-hidden />,
  pin: <MapPinIcon data-icon="inline-start" weight="bold" aria-hidden />,
} as const;

/**
 * Ficha de necesidad de un pedido de match: quién pide, el texto que redactó la IA (y el productor revisó) y
 * etiquetas con lo más importante (urgencia, zona, hectáreas, cultivos, temas). Componente tonto del Design System:
 * Card con doble bisel, Badges pill y solo tokens. El texto se muestra como texto plano, nunca como HTML.
 */
export default function NeedBriefCard({
  counterpartName,
  counterpartCaption,
  brief,
  statusLabel,
  statusVariant = 'secondary',
  requestedAt,
  footer,
  className,
}: NeedBriefCardProps) {
  const tags = needBriefTags(brief);
  const caption = [counterpartCaption, requestedAt].filter(Boolean).join(' · ');

  return (
    <Card surface="paper" className={className} coreClassName="flex flex-col gap-4 p-5">
      <header className="flex items-start gap-3">
        <Avatar initials={initialsOfName(counterpartName)} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-body text-pine truncate font-semibold">{counterpartName}</p>
          {caption && <p className="text-caption text-olive">{caption}</p>}
        </div>
        {statusLabel && <Badge variant={statusVariant}>{statusLabel}</Badge>}
      </header>

      <p className="text-body text-pine whitespace-pre-line">{brief.summary}</p>

      {tags.length > 0 && (
        <ul aria-label="Datos del pedido" className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag.key}>
              <Badge variant={TAG_VARIANT[tag.variant]} className={cn(tag.mono && 'font-mono')}>
                {tag.icon && ICONS[tag.icon]}
                {tag.label}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      {footer && <div className="border-pine/10 border-t pt-4">{footer}</div>}
    </Card>
  );
}
