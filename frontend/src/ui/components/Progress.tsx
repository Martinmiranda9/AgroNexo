// Cashmere Progress (registro `cashmere/progress-base`): carril hundido y relleno plano. Conserva Label/Value.
// `size` sigue la demo "Progress Sizes" de la vitrina de Cashmere: thin (4px, carril primary/20), default y thick.
'use client';

import { Progress as ProgressPrimitive } from '@base-ui/react/progress';
import { cn } from '@/shared/utils/cn';

type ProgressSize = 'thin' | 'default' | 'thick';

const TRACK_SIZES: Record<ProgressSize, string> = {
  thin: 'h-1 border-0 bg-primary/20 [box-shadow:none]',
  default: '',
  thick: 'h-3',
};

function Progress({
  className,
  children,
  value,
  size = 'default',
  ...props
}: ProgressPrimitive.Root.Props & { size?: ProgressSize }) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      data-size={size}
      className={cn('flex flex-wrap gap-3', className)}
      {...props}
    >
      {children}
      <ProgressTrack className={TRACK_SIZES[size]}>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        'bg-input border-border relative flex h-2 w-full items-center overflow-hidden rounded-full border [box-shadow:var(--shadow-inset)]',
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  );
}

function ProgressIndicator({ className, ...props }: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        'bg-primary h-full [box-shadow:var(--shadow-primary)] transition-all duration-500 ease-out motion-reduce:transition-none',
        className
      )}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn('text-sm font-medium', className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn('text-muted-foreground ml-auto text-sm tabular-nums', className)}
      data-slot="progress-value"
      {...props}
    />
  );
}

export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue };
