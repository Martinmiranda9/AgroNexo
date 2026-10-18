import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/core/auth/server';
import { SIDEBAR_COOKIE, SidebarStateProvider, isCollapsedValue } from '@/features/app-shell';
import { Toaster } from '@/ui/components/Toaster';

/**
 * Todas las rutas autenticadas requieren sesión; sin ella, vuelven al login. Acá se lee si el sidebar va colapsado,
 * para que el marco (y su marcador de carga) salga con el ancho que eligió el usuario.
 */
export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const collapsed = isCollapsedValue((await cookies()).get(SIDEBAR_COOKIE)?.value);

  return (
    <SidebarStateProvider defaultCollapsed={collapsed}>
      {children}
      <Toaster />
    </SidebarStateProvider>
  );
}
