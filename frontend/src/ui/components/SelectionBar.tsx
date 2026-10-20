'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MdClose } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import { IconButton } from './IconButton';
import { Separator } from './Separator';

/*
 * Barra flotante de acciones sobre filas elegidas (la de "2 Selected · Apply code · Edit info · Delete" de la
 * referencia de tabla). Propio de AgroNexo, armado con piezas de Cashmere (pastilla blanca con --shadow-l,
 * `IconButton`, `Separator`): Cashmere no trae una barra de selección.
 * Aparece abajo al centro mientras haya algo elegido; las acciones son `Button` size="sm" variant="outline" (o
 * "destructive") que pasa quien la usa. Escape o la cruz limpian la selección.
 */

interface SelectionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Filas elegidas: con 0 la barra se oculta. */
  count: number;
  /** "seleccionada" / "seleccionadas" según el contexto ("actividad seleccionada"). */
  noun?: { one: string; other: string };
  onClear: () => void;
  children: React.ReactNode;
}

function SelectionBar({
  count,
  noun = { one: 'seleccionada', other: 'seleccionadas' },
  onClear,
  className,
  children,
  ...props
}: SelectionBarProps) {
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (count === 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClear();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [count, onClear]);

  return (
    <>
      {/* Siempre montado: el lector de pantalla anuncia cuántas filas quedan elegidas. */}
      <p className="sr-only" aria-live="polite">
        {count > 0 ? `${count} ${count === 1 ? noun.one : noun.other}` : ''}
      </p>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
          >
            <div
              role="toolbar"
              aria-label="Acciones sobre lo seleccionado"
              data-slot="selection-bar"
              className={cn(
                'bg-card border-border pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-full border py-1.5 pr-1.5 pl-4 [box-shadow:var(--shadow-l)]',
                className
              )}
              {...props}
            >
              <span className="text-foreground text-sm font-medium whitespace-nowrap tabular-nums">
                {count}{' '}
                <span className="text-muted-foreground font-normal">
                  {count === 1 ? noun.one : noun.other}
                </span>
              </span>
              <Separator orientation="vertical" className="mx-1 h-5 self-center" />
              <div className="flex items-center gap-1.5">{children}</div>
              <IconButton
                variant="ghost"
                size="default"
                shape="round"
                aria-label="Quitar la selección"
                onClick={onClear}
              >
                <MdClose aria-hidden />
              </IconButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { SelectionBar };
