import type { Metadata } from 'next';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Restablecer contraseña | AgroNexo',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-bg-card px-8 py-10 text-pine antialiased">
      <ForgotPasswordForm />
    </main>
  );
}
