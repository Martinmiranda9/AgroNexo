import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `light`: sobre superficies Beige.
   * `onDark`: sobre Pine o fondos con gradiente; el bisel externo se vuelve translúcido.
   */
  surface?: 'light' | 'onDark';
  /** Clases del núcleo interno (padding, layout). `className` aplica al bisel externo (posición, ancho). */
  coreClassName?: string;
}

const SHELL = {
  light: 'bg-beige-dark/60 ring-1 ring-pine/10',
  onDark: 'bg-beige/12 ring-1 ring-beige/25 backdrop-blur-md',
} as const;

/**
 * Card estándar del Design System con double-bezel: bisel externo (22px) + núcleo interno (16px),
 * radios concéntricos. El núcleo es `bg-card` con borde hairline Pine.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ surface = 'light', className, coreClassName, children, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-[22px] p-1.5', SHELL[surface], className)} {...props}>
      <div
        className={cn('overflow-hidden rounded-card border border-pine/10 bg-bg-card text-pine', coreClassName)}
      >
        {children}
      </div>
    </div>
  ),
);

Card.displayName = 'Card';

export default Card;
