'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere Sidebar (registro `cashmere/sidebar`): columna de navegación con header, grupos, ítems y footer.
 * AgroNexo:
 * - la superficie y los estados salen de los tokens `sidebar-*` de globals.css, así la paleta se cambia en un lugar;
 * - `variant="floating"`: el header, el contenido y el footer son pastillas blancas separadas sobre el lienzo, con
 *   ítems redondos (la columna de la referencia del tablero). `panel` es la columna original de Cashmere;
 * - `collapsed` (Cashmere declara `collapsible` sin implementarlo): la columna queda solo con los íconos y el texto
 *   de cada ítem se oculta; el contador pasa a un globo sobre el ícono;
 * - `SidebarItem` acepta `asChild` para los links de navegación (regla de Cashmere: "nav links → asChild")
 *   y `badge` para un contador a la derecha.
 */

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'panel' | 'floating';
  collapsed?: boolean;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, variant = 'panel', collapsed = false, ...props }, ref) => (
    <aside
      ref={ref}
      data-slot="sidebar"
      data-variant={variant}
      data-collapsed={collapsed}
      className={cn(
        'group/sidebar flex h-full flex-col',
        variant === 'panel' &&
          'bg-sidebar text-sidebar-foreground border-sidebar-border w-64 border-r',
        variant === 'floating' &&
          'text-sidebar-foreground gap-3 transition-[width] duration-200 ease-(--ease-out) motion-reduce:transition-none',
        variant === 'floating' && (collapsed ? 'w-[3.375rem]' : 'w-60'),
        className
      )}
      {...props}
    />
  )
);
Sidebar.displayName = 'Sidebar';

/** Pastilla blanca de cada bloque en la variante flotante. */
const floatingBlock =
  'group-data-[variant=floating]/sidebar:bg-sidebar group-data-[variant=floating]/sidebar:border-sidebar-border group-data-[variant=floating]/sidebar:rounded-[1.6875rem] group-data-[variant=floating]/sidebar:border group-data-[variant=floating]/sidebar:p-1.5 group-data-[variant=floating]/sidebar:[box-shadow:var(--shadow-s)]';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-header"
      className={cn(
        'border-sidebar-border flex items-center gap-2 border-b px-4 py-3',
        floatingBlock,
        'group-data-[variant=floating]/sidebar:flex-col group-data-[variant=floating]/sidebar:items-stretch group-data-[variant=floating]/sidebar:gap-1',
        className
      )}
      {...props}
    />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-content"
      className={cn(
        'flex-1 overflow-y-auto p-2',
        floatingBlock,
        'group-data-[variant=floating]/sidebar:flex-none group-data-[variant=floating]/sidebar:overflow-x-hidden',
        className
      )}
      {...props}
    />
  )
);
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-footer"
      className={cn(
        'border-sidebar-border border-t px-4 py-3',
        floatingBlock,
        'group-data-[variant=floating]/sidebar:mt-auto group-data-[variant=floating]/sidebar:flex group-data-[variant=floating]/sidebar:flex-col group-data-[variant=floating]/sidebar:gap-1',
        className
      )}
      {...props}
    />
  )
);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-group"
      className={cn(
        'flex flex-col gap-0.5 py-2',
        'group-data-[variant=floating]/sidebar:gap-1 group-data-[variant=floating]/sidebar:py-0',
        className
      )}
      {...props}
    />
  )
);
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-group-label"
      className={cn(
        'text-sidebar-label px-3 pb-1.5 text-xs font-medium tracking-wider uppercase',
        'group-data-[collapsed=true]/sidebar:sr-only',
        className
      )}
      {...props}
    />
  )
);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  /** AgroNexo: contador u otra marca a la derecha del texto. */
  badge?: React.ReactNode;
  asChild?: boolean;
}

const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, active, icon, badge, asChild, children, ...props }, ref) => {
    const classes = cn(
      'relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium',
      'transition-[background-color,color,box-shadow] duration-150',
      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      'focus-visible:ring-sidebar-ring/60 focus-visible:ring-2 focus-visible:outline-none',
      'group-data-[variant=floating]/sidebar:h-10 group-data-[variant=floating]/sidebar:rounded-full group-data-[variant=floating]/sidebar:px-[0.6875rem] group-data-[variant=floating]/sidebar:py-0',
      active &&
        'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
      className
    );

    const content = (child: React.ReactNode) => (
      <>
        {icon && (
          <span className="flex size-[18px] shrink-0 items-center justify-center">{icon}</span>
        )}
        <span className="flex-1 truncate whitespace-nowrap group-data-[collapsed=true]/sidebar:sr-only">
          {child}
        </span>
        {badge && (
          <span className="flex shrink-0 group-data-[collapsed=true]/sidebar:absolute group-data-[collapsed=true]/sidebar:-top-1 group-data-[collapsed=true]/sidebar:-right-1">
            {badge}
          </span>
        )}
      </>
    );

    if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
      return (
        <Slot
          ref={ref}
          data-slot="sidebar-item"
          data-active={active || undefined}
          className={classes}
          {...props}
        >
          {React.cloneElement(children, undefined, content(children.props.children))}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        data-slot="sidebar-item"
        data-active={active || undefined}
        className={classes}
        {...props}
      >
        {content(children)}
      </button>
    );
  }
);
SidebarItem.displayName = 'SidebarItem';

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
};
