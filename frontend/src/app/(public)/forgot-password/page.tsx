import type { Metadata } from 'next';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Restablecer contraseña | AgroNexo',
};

export default function ForgotPasswordPage() {
  return (
    <main className="bg-card text-foreground flex min-h-[100dvh] w-full items-center justify-center px-8 py-10 antialiased">
      <ForgotPasswordForm />
    </main>
  );
}
