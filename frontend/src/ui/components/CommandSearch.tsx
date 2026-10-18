'use client';

import * as React from 'react';
import { MdClose, MdOutlineSearch } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere CommandSearch (registro `cashmere/command-search`, portado de Beautiful UI): búsqueda con filtro en vivo,
 * botón para limpiar y estado vacío.
 * AgroNexo: textos en español, íconos Material, foco en el campo al abrir (`autoFocus`) y Enter elige el primer
 * resultado. Sin sugerencias por defecto: la app pasa las suyas.
 */

interface CommandSearchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  suggestions: string[];
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: (suggestion: string) => void;
}

function CommandSearch({
  suggestions,
  placeholder = 'Buscar',
  autoFocus = false,
  onSelect,
  className,
  ...props
}: CommandSearchProps) {
  const [query, setQuery] = React.useState('');
  const results = query
    ? suggestions.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
    : suggestions.slice(0, 5);
  const empty = query.length > 2 && results.length === 0;

  const select = (item: string) => {
    setQuery(item);
    onSelect?.(item);
  };

  return (
    <div
      className={cn('flex min-h-[15.5rem] w-full max-w-[18rem] flex-col items-stretch', className)}
      {...props}
    >
      <div className="border-border bg-card w-full self-start overflow-hidden rounded-xl border shadow-md">
        {/* input row */}
        <div className="border-border focus-within:bg-accent/60 flex h-10 items-center gap-2 border-b px-3 transition-colors duration-100">
          <MdOutlineSearch size={16} className="text-muted-foreground shrink-0" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && results[0]) {
                event.preventDefault();
                select(results[0]);
              }
            }}
            placeholder={placeholder}
            aria-label={placeholder}
            autoFocus={autoFocus}
            className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-[0.8125rem] outline-none"
          />
          {query && (
            <button
              aria-label="Limpiar búsqueda"
              type="button"
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-[1.375rem] items-center justify-center rounded-full transition-colors duration-100"
              style={{ animation: 'bui-fade-in 150ms ease-out both' }}
            >
              <MdClose size={13} aria-hidden />
            </button>
          )}
        </div>

        {/* results / empty state */}
        {empty ? (
          <div
            className="flex flex-col items-center justify-center gap-1 px-4 py-8"
            style={{ animation: 'bui-fade-in 250ms ease-out both' }}
          >
            <span className="border-border bg-muted text-muted-foreground mb-1.5 flex size-8 items-center justify-center rounded-md border">
              <MdOutlineSearch size={16} aria-hidden />
            </span>
            <span className="text-foreground text-[0.8125rem] font-medium">Sin resultados</span>
            <span className="text-muted-foreground text-[0.75rem]">Probá con otra palabra</span>
          </div>
        ) : (
          <div className="p-1" role="listbox" aria-label="Sugerencias">
            {results.map((item) => (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => select(item)}
                className="text-foreground hover:bg-accent focus-visible:ring-ring flex h-8 w-full items-center rounded-[0.375rem] px-2 text-left text-[0.8125rem] transition-colors duration-100 focus-visible:ring-2 focus-visible:outline-none"
                style={{ animation: 'bui-fade-in 200ms ease-out both' }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes bui-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

export { CommandSearch };
