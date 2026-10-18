import { Card } from '@/ui/components/Card';
import { Skeleton } from '@/ui/components/Skeleton';

/** Marcador de la lista mientras se vuelve a pedir el ranking (por ejemplo, al cambiar la profesión). */
export default function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Actualizando resultados">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="flex flex-col gap-3 p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ))}
    </div>
  );
}
