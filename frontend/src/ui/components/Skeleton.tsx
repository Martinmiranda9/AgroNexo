// Código oficial: shadcn/ui `skeleton` (base-nova). Solo cambian los imports (alias de AgroNexo e íconos Phosphor).
import { cn } from '@/shared/utils/cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
