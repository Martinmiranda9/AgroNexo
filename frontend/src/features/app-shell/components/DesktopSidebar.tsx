'use client';

import { memo } from 'react';
import type { AppUser } from '../types';
import AppSidebar from './AppSidebar';
import { useSidebarState } from './SidebarStateProvider';

interface DesktopSidebarProps {
  user: AppUser;
  pendingCount?: number;
}

/** Sidebar de escritorio: recuerda si el usuario lo dejó colapsado o expandido en este navegador. */
function DesktopSidebar({ user, pendingCount }: DesktopSidebarProps) {
  const state = useSidebarState();

  return (
    <AppSidebar
      user={user}
      pendingCount={pendingCount}
      collapsed={state?.collapsed ?? false}
      onToggle={state?.toggle}
    />
  );
}

// Memorizado por lo mismo que `AppHeader`: solo cambia con el usuario, el contador o el estado colapsado.
export default memo(DesktopSidebar);
