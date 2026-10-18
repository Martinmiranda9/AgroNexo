'use client';

import type { ReactNode } from 'react';
import { IconButton } from '@/ui/components/IconButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/Popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/Tooltip';

interface HeaderPopoverButtonProps {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}

/** Ícono redondo del encabezado (avisos, ayuda) que abre su contenido en un popover debajo. */
export default function HeaderPopoverButton({ label, icon, children }: HeaderPopoverButtonProps) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={<IconButton variant="ghost" size="lg" shape="round" aria-label={label} />}
            />
          }
        >
          {icon}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" sideOffset={10} className="w-80">
        {children}
      </PopoverContent>
    </Popover>
  );
}
