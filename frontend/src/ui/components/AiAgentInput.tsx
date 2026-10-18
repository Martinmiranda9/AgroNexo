'use client';

// Cashmere AI Agent Input (registro `cashmere/ai-agent-input`, portado de https://www.aicss.dev/components/ai-agent-input).
// Ver los cambios de AgroNexo en AiAgentInput.module.css.
import * as React from 'react';
import { MdArrowUpward } from 'react-icons/md';
import { cn } from '@/shared/utils/cn';
import styles from './AiAgentInput.module.css';

interface AiAgentInputProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'onSubmit'
> {
  value: string;
  onValueChange: (value: string) => void;
  /** Se llama con Enter (Shift + Enter hace un salto de línea) o con el botón de enviar. */
  onSubmit: () => void;
  /** Si hay algo para enviar: el botón se pinta y Enter envía. */
  canSubmit: boolean;
  /** Nombre del botón de enviar para el lector de pantalla y el tooltip. */
  submitLabel: string;
  /** Acciones a la izquierda de la fila (por ejemplo, un `AiAgentInputIconButton`). */
  leading?: React.ReactNode;
  /** Mientras la IA trabaja: el aro animado gira sobre el borde. */
  busy?: boolean;
}

const AiAgentInput = React.forwardRef<HTMLTextAreaElement, AiAgentInputProps>(
  (
    {
      value,
      onValueChange,
      onSubmit,
      canSubmit,
      submitLabel,
      leading,
      busy = false,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const sendActive = canSubmit && !busy;

    return (
      <div className={cn(styles.wrap, className)}>
        <div className={styles.frame} data-busy={busy || undefined}>
          <textarea
            ref={ref}
            className={styles.field}
            value={value}
            rows={2}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (event.defaultPrevented) return;
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                if (sendActive) onSubmit();
              }
            }}
            {...props}
          />

          <div className={styles.row}>
            <div className={styles.left}>{leading}</div>
            <div className={styles.right}>
              {/* Sin `disabled` nativo: así sigue en el orden de tabulación y el lector explica por qué no avanza. */}
              <button
                type="button"
                className={cn(styles.iconBtn, styles.send, sendActive && styles.sendActive)}
                aria-label={submitLabel}
                title={submitLabel}
                aria-disabled={!sendActive}
                aria-describedby={props['aria-describedby']}
                onClick={() => sendActive && onSubmit()}
              >
                <MdArrowUpward size={20} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
AiAgentInput.displayName = 'AiAgentInput';

/** Botón redondo de la fila de acciones (en el registro, el "+"). Siempre con `aria-label`. */
const AiAgentInputIconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-label': string }
>(({ className, type = 'button', ...props }, ref) => (
  <button ref={ref} type={type} className={cn(styles.iconBtn, className)} {...props} />
));
AiAgentInputIconButton.displayName = 'AiAgentInputIconButton';

export { AiAgentInput, AiAgentInputIconButton };
