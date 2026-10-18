import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { formFieldBase, formFieldMultiLine } from './_shared';

// Cashmere Textarea (registro `cashmere/textarea-base`).
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(formFieldBase, formFieldMultiLine, className)}
      {...props}
    />
  );
}

export { Textarea };
