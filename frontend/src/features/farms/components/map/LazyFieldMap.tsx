'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/ui/components/Skeleton';

/** El mapa del campo, cargado solo en el navegador (Leaflet usa `window`). */
const LazyFieldMap = dynamic(() => import('@/ui/components/FieldMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-80 w-full rounded-xl" />,
});

export default LazyFieldMap;
