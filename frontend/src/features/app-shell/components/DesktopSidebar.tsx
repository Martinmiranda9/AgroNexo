'use client';

import type { AppUser } from '../types';
import AppSidebar from './AppSidebar';
import { useSidebarState } from './SidebarStateProvider';

interface DesktopSidebarProps {
  user: AppUser;
  pendingCount?: number;
}

/** Sidebar de escritorio: recuerda si el usuario lo dejó colapsado o expandido en este navegador. */
export default function DesktopSidebar({ user, pendingCount }: DesktopSidebarProps) {
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
