import type { ReactNode } from 'react';

interface AppShellProps {
  /** Barra de arriba del contenido (avisos, ayuda y perfil; en celular, además el menú y el logo). */
  header: ReactNode;
  /** Sidebar de una columna, a toda la altura: se muestra desde `lg`. En celular vive en el panel del menú. */
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * Marco de las pantallas autenticadas: el sidebar blanco de una sola columna a la izquierda, fijo y a toda la altura,
 * y a la derecha el lienzo con la barra de arriba y el contenido, que scrollea.
 */
export default function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <div data-slot="app-shell" className="bg-canvas flex min-h-[100dvh]">
      {/* z-20: por encima de los brillos `fixed` de algunas pantallas (BrandGlow en Buscar). */}
      <div className="sticky top-0 z-20 hidden h-[100dvh] shrink-0 lg:block">{sidebar}</div>
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <div className="min-w-0 flex-1 px-4 pb-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
