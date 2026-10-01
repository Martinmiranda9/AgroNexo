import { redirect } from 'next/navigation';
import { getSessionUser } from '@/core/auth/server';

/** Todas las rutas autenticadas requieren sesión; sin ella, vuelven al login. */
export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return children;
}
