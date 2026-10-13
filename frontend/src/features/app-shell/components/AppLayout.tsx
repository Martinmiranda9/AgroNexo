import type { ReactNode } from 'react';
import AppShell from '@/ui/layouts/AppShell';
import type { AppUser } from '../types';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  user: AppUser;
  /** Solicitudes esperando respuesta: contador junto a "Solicitudes" en la barra y en el encabezado. */
  pendingCount?: number;
  children: ReactNode;
}

/**
 * Marco de las pantallas autenticadas: barra lateral en pine desde `lg` y, en celular y tablet, el encabezado de
 * siempre. Versión básica, a reemplazar por la plantilla definitiva de sidebar y panel.
 */
export default function AppLayout({ user, pendingCount, children }: AppLayoutProps) {
  return (
    <AppShell
      sidebar={<AppSidebar user={user} pendingCount={pendingCount} />}
      header={<AppHeader user={user} pendingCount={pendingCount} />}
    >
      {children}
    </AppShell>
  );
}
