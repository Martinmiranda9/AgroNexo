'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdOutlineSearch } from 'react-icons/md';
import type { Workspace } from '@/core/models/farm.model';
import { farmRoute } from '@/shared/constants/routes';
import { CommandSearch } from '@/ui/components/CommandSearch';
import { Kbd, KbdGroup } from '@/ui/components/Kbd';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/Popover';
import { SidebarItem } from '@/ui/components/Sidebar';
import { NAV } from '../navigation';
import type { AppUser } from '../types';
import WithLabel from './WithLabel';

interface SearchCommandProps {
  user: AppUser;
  /** Campos del usuario (`null` mientras cargan): se suman a las secciones. */
  farms: Workspace[] | null;
  /** Columna colapsada: queda la lupa con su nombre en tooltip. */
  collapsed?: boolean;
  /** Atajo de teclado. Solo uno de los sidebars montados (el de escritorio) lo escucha. */
  shortcut?: boolean;
}

/**
 * Búsqueda de arriba del sidebar, con forma de campo como en la referencia: abre la búsqueda (también con Ctrl + K o
 * ⌘ + K) sobre las secciones y los campos del usuario, sin backend.
 */
export default function SearchCommand({
  user,
  farms,
  collapsed = false,
  shortcut = false,
}: SearchCommandProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcut]);

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
      <WithLabel label="Buscar · Ctrl + K" show={collapsed}>
        <PopoverTrigger
          render={
            <SidebarItem
              variant="field"
              aria-label="Buscar"
              aria-keyshortcuts="Control+K Meta+K"
              icon={<MdOutlineSearch size={20} aria-hidden />}
              badge={
                <KbdGroup aria-hidden className="group-data-[collapsed=true]/sidebar:hidden">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              }
            />
          }
        >
          Buscar
        </PopoverTrigger>
      </WithLabel>
      <PopoverContent
        side={collapsed ? 'right' : 'bottom'}
        align="start"
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
