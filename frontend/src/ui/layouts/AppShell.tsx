import type { ReactNode } from 'react';

interface AppShellProps {
  /** Barra lateral: se muestra desde `lg`. */
  sidebar: ReactNode;
  /** Encabezado para celular y tablet: se oculta desde `lg`, donde la navegación vive en la barra lateral. */
  header?: ReactNode;
  children: ReactNode;
}

/** Marco de las pantallas autenticadas: barra lateral fija a la izquierda y el contenido sobre el lienzo. */
export default function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <div className="lg:grid lg:min-h-[100dvh] lg:grid-cols-[256px_minmax(0,1fr)]">
      {/* Por encima del brillo de fondo (`BrandGlow` es fixed) para que la barra quede limpia. */}
      <div className="relative z-20 hidden lg:block">{sidebar}</div>
      <div className="min-w-0">
        {header && <div className="contents lg:hidden">{header}</div>}
        {children}
      </div>
    </div>
  );
}
