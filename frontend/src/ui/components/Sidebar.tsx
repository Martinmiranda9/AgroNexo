'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/shared/utils/cn';

/*
 * Cashmere Sidebar (registro `cashmere/sidebar`): una sola columna con header, grupos con rótulo, ítems y footer,
 * separada del contenido por un borde. AgroNexo:
 * - la superficie y los estados salen de los tokens `sidebar-*` de globals.css, así la paleta se cambia en un lugar;
 * - `collapsed` (Cashmere declara `collapsible` sin implementarlo): la columna queda solo con los íconos y el texto
 *   de cada ítem y de cada rótulo se oculta (sigue para el lector de pantalla); el contador pasa a un globo sobre
 *   el ícono;
 * - ítems en pastilla de 40 px (botones pill de Cashmere), activo en pine;
 * - `SidebarItem` acepta `asChild` para los links de navegación (regla de Cashmere: "nav links → asChild")
 *   y `badge` para un contador o una acción a la derecha.
 */

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, ...props }, ref) => (
    <aside
      ref={ref}
      data-slot="sidebar"
      data-collapsed={collapsed}
      className={cn(
        'group/sidebar bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full flex-col border-r',
        'transition-[width] duration-200 ease-(--ease-out) motion-reduce:transition-none',
        collapsed ? 'w-[4.5rem]' : 'w-64',
        className
      )}
      {...props}
    />
  )
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-header"
      className={cn('flex flex-col gap-3 px-3 pt-4 pb-2', className)}
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
        'flex flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-3 py-2',
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
      className={cn('border-sidebar-border flex flex-col gap-1 border-t px-3 py-3', className)}
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
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  )
);
SidebarGroup.displayName = 'SidebarGroup';

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Acción chica a la derecha del rótulo (por ejemplo "+" para crear). Se oculta con la columna colapsada. */
  action?: React.ReactNode;
}

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ className, action, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-group-label"
      className={cn(
        'text-sidebar-label flex h-7 items-center justify-between gap-2 px-3 text-xs font-medium',
        'group-data-[collapsed=true]/sidebar:sr-only',
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {action}
    </div>
  )
);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `field`: con forma de campo (fondo gris y borde), para el acceso a la búsqueda de arriba. */
  variant?: 'default' | 'field';
  active?: boolean;
  icon?: React.ReactNode;
  /** AgroNexo: contador u otra marca a la derecha del texto. */
  badge?: React.ReactNode;
  asChild?: boolean;
}

const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, variant = 'default', active, icon, badge, asChild, children, ...props }, ref) => {
    const classes = cn(
      'relative flex h-10 w-full shrink-0 items-center gap-3 rounded-full px-[0.6875rem] text-left text-sm font-medium',
      'transition-[background-color,color,box-shadow] duration-150',
      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      variant === 'field' && 'bg-muted border-sidebar-border border font-normal',
      'data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground',
      'focus-visible:ring-sidebar-ring/60 focus-visible:ring-2 focus-visible:outline-none',
      active &&
        'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
      className
    );

    const content = (child: React.ReactNode) => (
      <>
        {icon && (
          <span className="flex size-[1.125rem] shrink-0 items-center justify-center">{icon}</span>
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
