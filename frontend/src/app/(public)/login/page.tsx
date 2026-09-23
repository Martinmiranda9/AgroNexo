import type { Metadata } from 'next';
import AgroConnectAuthModal from '@/features/auth/components/AgroConnectAuthModal';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | AgroConnect',
  description: 'Conectá con productores y profesionales del campo.',
};

export default function LoginPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#fef7e5] text-[#00311e] antialiased selection:bg-[#00311e]/10 selection:text-[#00311e]">
      <AgroConnectAuthModal />
    </main>
  );
}
