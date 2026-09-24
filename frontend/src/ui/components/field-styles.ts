import { cn } from '@/shared/utils/cn';

/** Estilo único de controles de formulario (input, select) del UI Kit. */
export function controlClass(hasError?: boolean) {
  return cn(
    'w-full rounded-xl border bg-beige text-sm text-pine placeholder:text-neutral-warm',
    'outline-none transition-all duration-200',
    'focus:border-pine focus:ring-2 focus:ring-pine/15',
    'disabled:cursor-not-allowed disabled:opacity-50',
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger/20'
      : 'border-neutral-warm/50 hover:border-pine/40',
  );
}
