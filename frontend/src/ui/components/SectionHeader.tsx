import * as React from 'react';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere SectionHeader (registro `cashmere/section-header`): título, bajada y acciones a la derecha. AgroNexo suma
 * `as` para usarlo como título de página (`h1`, en la escala heading-lg de AgroNexo) o de sección (`h2`, la original).
 */

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  as?: 'h1' | 'h2';
}

const TITLE = {
  h1: 'text-heading-lg tracking-heading text-foreground',
  h2: 'text-xl font-semibold tracking-tight text-foreground',
} as const;

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, description, eyebrow, actions, as: Heading = 'h2', ...props }, ref) => (
    <div
      ref={ref}
      data-slot="section-header"
      className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="text-primary mb-2 text-xs font-semibold tracking-wider uppercase">
            {eyebrow}
          </div>
        )}
        <Heading className={TITLE[Heading]}>{title}</Heading>
        {description && (
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
);
SectionHeader.displayName = 'SectionHeader';

export { SectionHeader };
