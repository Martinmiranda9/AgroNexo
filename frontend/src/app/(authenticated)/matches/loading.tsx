import { AppLayoutSkeleton } from '@/features/app-shell';

// Mientras llegan las solicitudes: el marco de la app con la grilla de `MatchRequestList` en Skeleton.
export default function MatchesLoading() {
  return (
    <AppLayoutSkeleton label="Solicitudes" cards={4} gridClassName="grid gap-4 lg:grid-cols-2" />
  );
}
