import { SpinnerIcon } from '@phosphor-icons/react/ssr';
import { cn } from '@/shared/utils/cn';

// Código base: shadcn/ui `spinner`. Ícono Phosphor (entrada /ssr: se usa también desde Server Components).
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <SpinnerIcon
      data-slot="spinner"
      role="status"
      aria-label="Cargando"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
