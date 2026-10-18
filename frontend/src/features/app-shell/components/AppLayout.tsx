import type { ReactNode } from 'react';
import { TooltipProvider } from '@/ui/components/Tooltip';
import AppShell from '@/ui/layouts/AppShell';
import type { AppUser } from '../types';
import AppHeader from './AppHeader';
import DesktopSidebar from './DesktopSidebar';

interface AppLayoutProps {
  user: AppUser;
  /** Solicitudes esperando respuesta: contador junto a "Solicitudes" en el sidebar. */
  pendingCount?: number;
  children: ReactNode;
}

/**
 * Marco de las pantallas autenticadas: encabezado con búsqueda, avisos, ayuda y perfil, y el sidebar colapsable a la
 * izquierda desde `lg`. Sirve en pantallas de servidor y de cliente; el estado del sidebar lo da
 * `SidebarStateProvider` (layout de las rutas autenticadas).
 */
export default function AppLayout({ user, pendingCount, children }: AppLayoutProps) {
  return (
    <TooltipProvider delay={300}>
      <AppShell
        header={<AppHeader user={user} pendingCount={pendingCount} />}
        sidebar={<DesktopSidebar user={user} pendingCount={pendingCount} />}
      >
        {children}
      </AppShell>
    </TooltipProvider>
  );
}
