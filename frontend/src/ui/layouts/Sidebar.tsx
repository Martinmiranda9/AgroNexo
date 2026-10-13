import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/shared/utils/cn';

export interface SidebarItem {
  href: string;
  label: string;
  icon: Icon;
  active?: boolean;
  /** Contador al lado del ítem (por ejemplo, solicitudes esperando respuesta). Se oculta en 0. */
  count?: number;
  /** Texto para lectores de pantalla después del número ("esperando respuesta"). */
  countLabel?: string;
}

interface SidebarProps {
  /** Logo arriba de todo. */
  brand: ReactNode;
  /** Rótulo del grupo de navegación. */
  label: string;
  items: SidebarItem[];
  /** Acción principal entre el logo y la navegación (por ejemplo, "Nuevo campo"). */
  action?: ReactNode;
  /** Cuenta del usuario y acciones, pegadas abajo. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Barra lateral de escritorio sobre pine: texto verde claro, hover un paso más claro y el ítem activo en verde 800.
 * Solo presentación: el feature decide qué ítems hay y cuál está activo.
 */
export default function Sidebar({ brand, label, items, action, footer, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground sticky top-0 flex h-[100dvh] flex-col gap-8 px-4 pt-6 pb-4',
        className
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="px-2">{brand}</div>
        {action}
      </div>

      <nav aria-label={label} className="flex flex-col gap-1">
        <p className="text-overline text-field-400 px-3 pb-2">{label}</p>
        {items.map(({ href, label: itemLabel, icon: ItemIcon, active, count, countLabel }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-body-sm flex h-11 items-center gap-3 rounded-lg px-3 font-medium transition-colors',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              'focus-visible:outline-sidebar-ring focus-visible:outline-2 focus-visible:outline-offset-1',
              active &&
                'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary'
            )}
          >
            <ItemIcon
              size={20}
              weight={active ? 'fill' : 'regular'}
              aria-hidden
              className="shrink-0"
            />
            <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
            {count !== undefined && count > 0 && (
              <span className="bg-sidebar-foreground text-sidebar text-caption rounded-pill min-w-6 px-1.5 text-center font-mono">
                {count}
                {countLabel && <span className="sr-only"> {countLabel}</span>}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {footer && <div className="border-sidebar-border mt-auto border-t pt-4">{footer}</div>}
    </aside>
  );
}
