import * as React from 'react';
import { MdChevronLeft, MdChevronRight, MdMoreHoriz } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { buttonVariants } from './Button';

/*
 * Cashmere Pagination (registro `cashmere/pagination-base`). AgroNexo:
 * - íconos de Material en vez de Iconify y textos en español;
 * - suma `PaginationButton` (botón en vez de link) para tablas que paginan en el cliente;
 * - la página actual va en pine con texto sage-50 (selección activa de AgroNexo), no en el color del botón principal;
 * - el contenedor no se centra solo: lo ubica quien lo usa (en el pie de una tabla va a la derecha).
 */

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav aria-label="Paginación" className={cn('flex', className)} {...props} />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  )
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />
);
PaginationItem.displayName = 'PaginationItem';

const pageClasses = (isActive: boolean | undefined, className?: string) =>
  cn(
    buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'icon-sm' }),
    'cursor-pointer tabular-nums',
    isActive && 'bg-pine text-sage-50 hover:bg-pine hover:text-sage-50',
    className
  );

type PaginationLinkProps = { isActive?: boolean } & React.ComponentProps<'a'>;

const PaginationLink = ({ className, isActive, ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={pageClasses(isActive, className)}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

type PaginationButtonProps = { isActive?: boolean } & React.ComponentProps<'button'>;

const PaginationButton = ({ className, isActive, ...props }: PaginationButtonProps) => (
  <button
    type="button"
    aria-current={isActive ? 'page' : undefined}
    className={pageClasses(isActive, className)}
    {...props}
  />
);
PaginationButton.displayName = 'PaginationButton';

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<'button'>) => (
  <PaginationButton aria-label="Página anterior" className={className} {...props}>
    <MdChevronLeft className="size-5" aria-hidden />
  </PaginationButton>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }: React.ComponentProps<'button'>) => (
  <PaginationButton aria-label="Página siguiente" className={className} {...props}>
    <MdChevronRight className="size-5" aria-hidden />
  </PaginationButton>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('text-muted-foreground flex size-8 items-center justify-center', className)}
    {...props}
  >
    <MdMoreHoriz className="size-4" />
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

/** Páginas a mostrar: la primera, la última y las vecinas de la actual; `null` marca un salto ("…"). */
function pageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1 ? [null, page] : [page]
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationButton,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  pageWindow,
};
