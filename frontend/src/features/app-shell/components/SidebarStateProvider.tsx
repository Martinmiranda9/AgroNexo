'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { SIDEBAR_COOKIE } from '../sidebar-state';

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarStateContext = createContext<SidebarState | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Si el sidebar va colapsado o expandido. Lo monta el layout de las rutas autenticadas con la cookie leída en el
 * servidor, así `AppLayout` sirve también dentro de pantallas cliente y el ancho no salta al cargar.
 */
export function SidebarStateProvider({
  defaultCollapsed,
  children,
}: {
  defaultCollapsed: boolean;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? 'collapsed' : 'expanded'}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  };

  return (
    <SidebarStateContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarStateContext.Provider>
  );
}

/** Fuera del provider (no debería pasar) el sidebar queda expandido y sin botón para colapsar. */
export function useSidebarState(): SidebarState | null {
  return useContext(SidebarStateContext);
}
