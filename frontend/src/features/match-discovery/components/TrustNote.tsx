import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { cn } from '@/shared/utils/cn';

interface TrustNoteProps {
  firstName: string;
  className?: string;
}

/**
 * Lo que pasa al solicitar el match, junto al CTA: baja el costo de decidir. Solo promete lo que el sistema hace
 * hoy (no hay vencimiento automático ni aviso por WhatsApp todavía).
 */
export default function TrustNote({ firstName, className }: TrustNoteProps) {
  return (
    <Alert role="note" className={cn('bg-surface-sunken border-transparent px-4 py-3', className)}>
      <LockSimpleIcon className="text-olive" aria-hidden />
      <AlertDescription className="text-body-sm text-dark">
        Solicitar es gratis y no te compromete. {firstName} ve lo que necesitás y decide si acepta.
      </AlertDescription>
    </Alert>
  );
}
