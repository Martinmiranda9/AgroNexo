import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AgroNexoAuthModal from '@/features/auth/components/AgroNexoAuthModal';
import { AUTH_CONTINUE_PATH } from '@/core/auth/config';
import { getSessionUser } from '@/core/auth/server';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | AgroNexo',
  description: 'Conectá con productores y profesionales del campo.',
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // Quien ya tiene sesión no necesita ver el login: se lo manda a donde corresponda.
  if (await getSessionUser()) redirect(AUTH_CONTINUE_PATH);

  const { error } = await searchParams;

  return (
    <main className="min-h-[100dvh] w-full bg-[#fef7e5] text-[#00311e] antialiased selection:bg-[#00311e]/10 selection:text-[#00311e]">
      <AgroNexoAuthModal mode="login" error={error} />
    </main>
  );
}
