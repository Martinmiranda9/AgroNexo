'use client';

import BrandLogo from '@/ui/components/BrandLogo';
import { Card } from '@/ui/components/Card';
import { Separator } from '@/ui/components/Separator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/ui/components/Sidebar';
import { Skeleton } from '@/ui/components/Skeleton';
import AppShell from '@/ui/layouts/AppShell';
import { useSidebarState } from './SidebarStateProvider';

interface AppLayoutSkeletonProps {
  /** Nombre de la pantalla que está cargando, para el lector de pantalla. */
  label: string;
  /** Cards de la lista: la grilla imita la de la pantalla real para que nada salte al llegar los datos. */
  cards: number;
  /** Clases de la grilla, las mismas que usa la lista de la pantalla. */
  gridClassName: string;
}

/**
 * Marcador de carga de las pantallas autenticadas (`loading.tsx`): el mismo marco que `AppLayout` (sidebar de una
 * columna con el ancho que eligió el usuario y la barra de arriba) con Skeleton donde van el título y las cards.
 */
export default function AppLayoutSkeleton({ label, cards, gridClassName }: AppLayoutSkeletonProps) {
  const collapsed = useSidebarState()?.collapsed ?? false;

  const header = (
    <header className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6">
      <div className="lg:hidden">
        <BrandLogo compactOnMobile />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full md:w-40" />
      </div>
    </header>
  );

  const sidebar = (
    <Sidebar collapsed={collapsed} aria-hidden>
      <SidebarHeader>
        <div className="px-1">
          <BrandLogo />
        </div>
        <Skeleton className="h-10 w-full rounded-full" />
      </SidebarHeader>
      <SidebarContent>
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-10 w-full rounded-full" />
        ))}
        <Separator />
        {[0, 1].map((row) => (
          <Skeleton key={row} className="h-10 w-full rounded-full" />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <AppShell header={header} sidebar={sidebar}>
      <main
        className="mx-auto max-w-[1180px] pt-4 pb-10"
        role="status"
        aria-label={`Cargando ${label}`}
      >
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        <ul aria-hidden className={`mt-8 ${gridClassName}`}>
          {Array.from({ length: cards }, (_, index) => (
            <li key={index}>
              <Card className="flex flex-col gap-3 p-5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </Card>
            </li>
          ))}
        </ul>
      </main>
    </AppShell>
  );
}
