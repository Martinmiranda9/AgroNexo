import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Tailwind-merge no conoce la escala tipográfica custom del Design System (definida en
// globals.css vía @theme como --text-*), así que trata `text-body`, `text-heading-lg`, etc.
// como si fueran del mismo grupo que `text-[#hex]` (color) y descarta uno de los dos.
// Esto rompía botones "pine" (bg y texto del mismo verde, ilegible): había que registrar
// estos nombres bajo el grupo de font-size para que dejen de pisar el color de texto.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['caption', 'body-sm', 'body', 'body-lg', 'heading-sm', 'heading-md', 'heading-lg', 'heading-xl', 'figure', 'overline'],
    },
  },
});

/**
 * Combina clases de Tailwind de forma segura, resolviendo conflictos.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
