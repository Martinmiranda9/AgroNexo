// Cashmere Item (registro `cashmere/item`) sobre la API de subcomponentes que ya usaba la app. Suma
// `interactive` y `selected` del registro.
import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { Separator } from './Separator';

function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        'group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2',
        className
      )}
      {...props}
    />
  );
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('my-2', className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  'group/item text-card-foreground flex w-full flex-wrap items-center rounded-lg border text-sm transition-[background-color,box-shadow,border-color,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
  {
    variants: {
      variant: {
        default: 'bg-card border-border [box-shadow:var(--shadow-s)]',
        outline: 'bg-card border-border [box-shadow:var(--shadow-s)]',
        muted: 'bg-muted border-transparent',
      },
      size: {
        default: 'gap-3 px-3 py-2',
        sm: 'gap-3 px-3 py-2',
        xs: 'gap-2 px-2.5 py-1.5 in-data-[slot=dropdown-menu-content]:p-0',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-accent hover:[box-shadow:var(--shadow-button-hover)] active:translate-y-px active:[box-shadow:var(--shadow-inset)]',
        false: '',
      },
      selected: {
        // AgroNexo: lo seleccionado se marca en pine (regla de selección), no con el primario.
        true: 'border-pine/40 bg-accent [box-shadow:var(--shadow-m)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
      selected: false,
    },
  }
);

function Item({
  className,
  variant = 'default',
  size = 'default',
  interactive,
  selected,
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof itemVariants>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(itemVariants({ variant, size, interactive, selected, className })),
      },
      props
    ),
    render,
    state: {
      slot: 'item',
      variant,
      size,
    },
  });
}

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-muted-foreground size-8 rounded-lg [box-shadow:var(--shadow-s)] [&_svg:not([class*='size-'])]:size-4",
        image:
          'size-10 overflow-hidden rounded-lg group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        'flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none',
        className
      )}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        'text-foreground line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4',
        className
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-foreground line-clamp-2 text-left text-xs leading-normal font-normal [&>a]:underline [&>a]:underline-offset-4',
        className
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="item-actions" className={cn('flex items-center gap-2', className)} {...props} />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-header"
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-footer"
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
