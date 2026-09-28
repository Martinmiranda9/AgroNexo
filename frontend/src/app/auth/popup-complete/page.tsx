import PopupComplete from '@/features/auth/components/PopupComplete';

export const dynamic = 'force-dynamic';

/** Destino final del popup de Google (ver `core/auth/google-sign-in.ts`). */
export default async function PopupCompletePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <PopupComplete error={error} />;
}
