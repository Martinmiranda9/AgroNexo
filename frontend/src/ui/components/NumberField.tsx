'use client';

import * as React from 'react';
import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { Label, NumberField as NumberFieldPrimitive } from '@heroui/react';
import { cn } from '@/shared/utils/cn';

// Componentes reales de HeroUI (`@heroui/react`): NumberField + Group + DecrementButton + Input + IncrementButton.
// No se importa el CSS de HeroUI (`@heroui/styles`): pisaría los tokens de AgroNexo. El look sale de las
// clases de abajo (Pine & Beige, alto 48px como `Input`); HeroUI aporta estructura, teclado y accesibilidad.
type RootProps = React.ComponentProps<typeof NumberFieldPrimitive>;
type GroupProps = React.ComponentProps<typeof NumberFieldPrimitive.Group>;
type InputProps = React.ComponentProps<typeof NumberFieldPrimitive.Input>;
type StepProps = React.ComponentProps<typeof NumberFieldPrimitive.IncrementButton>;
type LabelProps = React.ComponentProps<typeof Label>;

const str = (value: unknown) => (typeof value === 'string' ? value : undefined);

function NumberFieldRoot({ className, ...props }: RootProps) {
  return <NumberFieldPrimitive className={cn('flex flex-col gap-1.5', str(className))} {...props} />;
}

function NumberFieldLabel({ className, ...props }: LabelProps) {
  return (
    <Label
      className={cn('w-fit text-sm leading-none font-medium select-none', str(className))}
      {...props}
    />
  );
}

function NumberFieldGroup({ className, ...props }: GroupProps) {
  return (
    <NumberFieldPrimitive.Group
      className={cn(
        'grid grid-cols-[48px_1fr_48px] items-center overflow-hidden rounded-lg border border-input bg-transparent text-sm shadow-none transition-colors outline-none',
                'data-[focus-within=true]:border-ring data-[focus-within=true]:ring-3 data-[focus-within=true]:ring-ring/50',
        'data-[invalid=true]:border-destructive data-[invalid=true]:ring-3 data-[invalid=true]:ring-destructive/20',
        'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
        str(className),
      )}
      {...props}
    />
  );
}

function NumberFieldInput({ className, ...props }: InputProps) {
  return (
    <NumberFieldPrimitive.Input
      className={cn(
        'min-w-0 rounded-none border-0 bg-transparent px-3 py-2 text-center text-sm tabular-nums shadow-none outline-none placeholder:text-muted-foreground',
        str(className),
      )}
      {...props}
    />
  );
}

const stepButton =
  'flex h-full w-12 cursor-pointer items-center justify-center bg-transparent outline-none transition-[background-color,transform] border-input data-[hovered=true]:bg-muted data-[pressed=true]:scale-[0.97] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-muted-foreground data-[disabled=true]:hover:bg-transparent [&_svg]:size-4';

function NumberFieldDecrementButton({ className, ...props }: StepProps) {
  return (
    <NumberFieldPrimitive.DecrementButton className={cn(stepButton, 'border-e', str(className))} {...props}>
      <MinusIcon weight="bold" />
    </NumberFieldPrimitive.DecrementButton>
  );
}

function NumberFieldIncrementButton({ className, ...props }: StepProps) {
  return (
    <NumberFieldPrimitive.IncrementButton className={cn(stepButton, 'border-s', str(className))} {...props}>
      <PlusIcon weight="bold" />
    </NumberFieldPrimitive.IncrementButton>
  );
}

const NumberField = Object.assign(NumberFieldRoot, {
  Label: NumberFieldLabel,
  Group: NumberFieldGroup,
  Input: NumberFieldInput,
  DecrementButton: NumberFieldDecrementButton,
  IncrementButton: NumberFieldIncrementButton,
});

export { NumberField };
