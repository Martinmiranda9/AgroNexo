// Cashmere Skeleton (registro `cashmere/skeleton`).
import { cn } from '@/shared/utils/cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted animate-pulse rounded-lg', className)}
      {...props}
    />
  );
}

export { Skeleton };
