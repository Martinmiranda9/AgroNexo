import type { Metadata } from 'next';
import AgroNexoAuthModal from '@/features/auth/components/AgroNexoAuthModal';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | AgroNexo',
  description: 'Conectá con productores y profesionales del campo.',
};

export default function LoginPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#fef7e5] text-[#00311e] antialiased selection:bg-[#00311e]/10 selection:text-[#00311e]">
      <AgroNexoAuthModal />
    </main>
  );
}
