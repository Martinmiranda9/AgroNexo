import type * as React from 'react';
import { MdOutlinePlace, MdOutlineSchedule } from 'react-icons/md';
import type { VariantProps } from 'class-variance-authority';
import type { NeedBrief } from '@/shared/types/need-brief';
import { cn } from '@/shared/utils/cn';
import { InitialsAvatar } from './Avatar';
import { Badge, type badgeVariants } from './Badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card';
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
  clock: <MdOutlineSchedule data-icon="inline-start" aria-hidden />,
  pin: <MdOutlinePlace data-icon="inline-start" aria-hidden />,
} as const;

/**
 * Ficha de necesidad de un pedido de match: quién pide, el texto que redactó la IA (y el productor revisó) y
 * etiquetas con lo más importante (urgencia, zona, hectáreas, cultivos, temas). Componente tonto del Design System,
 * armado con las partes de la Card de Cashmere (`CardHeader`, `CardTitle`, `CardDescription`, `CardAction`,
 * `CardContent`, `CardFooter`), `InitialsAvatar` y `Badge`. El texto se muestra como texto plano, nunca como HTML.
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
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <InitialsAvatar initials={initialsOfName(counterpartName)} size="md" />
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{counterpartName}</CardTitle>
            {caption && <CardDescription>{caption}</CardDescription>}
          </div>
        </div>
        {statusLabel && (
          <CardAction>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-body whitespace-pre-line">{brief.summary}</p>

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
      </CardContent>

      {footer && (
        <CardFooter className="border-border mx-5 flex-col items-stretch gap-0 border-t px-0 pt-5">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
