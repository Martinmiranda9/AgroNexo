'use client';

import type { ReactElement } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/Tooltip';

/** Con la columna colapsada, el nombre de cada ítem aparece en un tooltip a la derecha del ícono. */
export default function WithLabel({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: ReactElement;
}) {
  return (
    <Tooltip disabled={!show}>
      <TooltipTrigger render={children} />
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
