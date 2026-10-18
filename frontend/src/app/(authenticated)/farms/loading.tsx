import { AppLayoutSkeleton } from '@/features/app-shell';

// Mientras llegan los campos: el marco de la app con la grilla de cards de `FarmsScreen` en Skeleton.
export default function FarmsLoading() {
  return (
    <AppLayoutSkeleton
      label="Campos"
      cards={3}
      gridClassName="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    />
  );
}
