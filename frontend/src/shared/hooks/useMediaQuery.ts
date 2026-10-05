'use client';

import { useSyncExternalStore } from 'react';

/** Coincidencia de una media query. En el servidor (y en la primera pintura) es `false`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
