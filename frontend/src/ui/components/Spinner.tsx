import { MdAutorenew } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';

// Código base: shadcn/ui `spinner`. Ícono Material `autorenew` (react-icons, también desde Server Components).
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <MdAutorenew
      data-slot="spinner"
      role="status"
      aria-label="Cargando"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
