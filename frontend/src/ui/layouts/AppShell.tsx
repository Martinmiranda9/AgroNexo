import type { ReactNode } from 'react';

interface AppShellProps {
  /** Encabezado fijo arriba, a todo el ancho. */
  header: ReactNode;
  /** Barra lateral: se muestra desde `lg`, debajo del encabezado. En celular vive en el panel del menú. */
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * Marco de las pantallas autenticadas (estructura de la referencia del tablero): lienzo gris, encabezado arriba y la
 * columna de pastillas del sidebar a la izquierda, fija mientras el contenido scrollea.
 */
export default function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <div className="bg-canvas min-h-[100dvh]">
      {header}
      <div className="flex gap-6 px-4 pb-6 sm:px-6">
        {/* z-20: por encima de los brillos `fixed` de algunas pantallas (BrandGlow en Buscar). */}
        <div className="sticky top-19 z-20 hidden h-[calc(100dvh-6.25rem)] shrink-0 self-start lg:block">
          {sidebar}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
