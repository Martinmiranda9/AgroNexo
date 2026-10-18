'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdOutlineSearch } from 'react-icons/md';
import { getWorkspacesAction } from '@/core/actions/get-workspaces.action';
import type { Workspace } from '@/core/models/farm.model';
import { farmRoute } from '@/shared/constants/routes';
import { CommandSearch } from '@/ui/components/CommandSearch';
import { IconButton } from '@/ui/components/IconButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/Popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/Tooltip';
import { NAV } from '../navigation';
import type { AppUser } from '../types';

/**
 * Lupa del encabezado: abre la búsqueda (también con Ctrl + K o ⌘ + K) sobre las secciones y los campos del usuario.
 * Los campos se piden la primera vez que se abre; si la API no responde, quedan solo las secciones.
 */
export default function SearchCommand({ user }: { user: AppUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [farms, setFarms] = useState<Workspace[] | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || farms !== null) return;
    getWorkspacesAction()
      .then((result) => setFarms(result.status === 'ok' ? result.workspaces : []))
      .catch(() => setFarms([]));
  }, [open, farms]);

  // Texto que se ve → a dónde lleva. Una sección gana si un campo se llama igual.
  const targets = useMemo(() => {
    const map = new Map<string, string>();
    for (const { label, href } of NAV[user.role]) map.set(label, href);
    for (const farm of farms ?? []) {
      if (!map.has(farm.name)) map.set(farm.name, farmRoute(farm.farmId));
    }
    return map;
  }, [user.role, farms]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={<IconButton variant="ghost" size="lg" shape="round" aria-label="Buscar" />}
            />
          }
        >
          <MdOutlineSearch aria-hidden />
        </TooltipTrigger>
        <TooltipContent>Buscar · Ctrl + K</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-80 gap-0 border-0 bg-transparent p-0 [box-shadow:none]"
      >
        <CommandSearch
          autoFocus
          suggestions={[...targets.keys()]}
          placeholder="Buscar secciones y campos"
          className="min-h-0 max-w-none"
          onSelect={(item) => {
            const href = targets.get(item);
            setOpen(false);
            if (href) router.push(href);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
