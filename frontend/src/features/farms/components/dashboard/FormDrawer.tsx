'use client';

import { Fragment, useState, type FormEvent, type ReactNode } from 'react';
import { MdArrowForward, MdErrorOutline } from 'react-icons/md';
import type { FarmMutationResult } from '@/core/models/farm-dashboard.model';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/components/Drawer';
import FarmDrawer, {
  DRAWER_BODY,
  DRAWER_FOOTER,
  DRAWER_HEADER,
  DRAWER_SPLIT_ASIDE,
  DRAWER_SPLIT_BODY,
  DRAWER_SPLIT_FIELDS,
  FarmDrawerCloseButton,
} from '../FarmDrawer';

/** Qué decirle al usuario según cómo respondió el backend. */
export function failureCopy(
  result: Exclude<FarmMutationResult<unknown>, { status: 'ok' }>
): string {
  switch (result.status) {
    case 'invalid':
      return result.message ?? 'Revisá los datos y probá de nuevo.';
    case 'conflict':
      return result.message ?? 'Eso ya está cargado en este campo.';
    case 'forbidden':
      return 'No tenés permiso para hacer este cambio en el campo.';
    case 'unauthorized':
      return 'Tu sesión venció. Volvé a ingresar para guardar el cambio.';
    case 'not-found':
      return 'No encontramos el campo o el lote. Puede que ya no tengas acceso.';
    default:
      return 'No pudimos guardar el cambio. Probá de nuevo en unos minutos.';
  }
}

interface FormShellProps {
  onClose: () => void;
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  /** Devuelve el mensaje de error a mostrar, o `null` si salió bien (y quien llama cierra el panel). */
  onSubmit: () => Promise<string | null>;
  /** Valida antes de enviar; con errores, no envía. */
  validate?: () => boolean;
  /** Lo que va al costado de los campos en pantalla completa (el mapa). */
  aside?: ReactNode;
  children: ReactNode;
}

/** Encabezado, cuerpo con los campos y pie con Cancelar y la acción, igual que "Nuevo campo". */
export function FormShell({
  onClose,
  title,
  description,
  submitLabel,
  pendingLabel,
  onSubmit,
  validate,
  aside,
  children,
}: FormShellProps) {
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (validate && !validate()) return;

    setPending(true);
    setFailure(null);
    const error = await onSubmit();
    setPending(false);
    if (error) setFailure(error);
  };

  const failureAlert = failure && (
    <Alert variant="destructive" role="alert">
      <MdErrorOutline aria-hidden />
      <AlertDescription>{failure}</AlertDescription>
    </Alert>
  );

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className={DRAWER_HEADER}>
        <DrawerTitle className="pr-10">{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
        <FarmDrawerCloseButton />
      </DrawerHeader>

      {aside ? (
        <fieldset disabled={pending} className={DRAWER_SPLIT_BODY}>
          <div className={DRAWER_SPLIT_FIELDS}>
            {children}
            {failureAlert}
          </div>
          <div className={DRAWER_SPLIT_ASIDE}>{aside}</div>
        </fieldset>
      ) : (
        <fieldset disabled={pending} className={DRAWER_BODY}>
          {children}
          {failureAlert}
        </fieldset>
      )}

      <DrawerFooter className={DRAWER_FOOTER}>
        <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" loading={pending} loadingText={pendingLabel}>
          {submitLabel}
          <MdArrowForward data-icon="inline-end" size={16} aria-hidden />
        </Button>
      </DrawerFooter>
    </form>
  );
}

interface FormDrawerProps {
  open: boolean;
  onClose: () => void;
  /** `full`: pantalla completa, para los formularios con mapa. */
  size?: 'panel' | 'full';
  /** El formulario: se monta de cero en cada apertura para que arranque vacío. */
  children: ReactNode;
}

/**
 * Panel de alta del tablero (actividad, campaña, lote, cultivo). Al cerrar, el formulario sigue montado para que la
 * animación no quede vacía; al abrir de nuevo, se remonta.
 */
export default function FormDrawer({ open, onClose, size, children }: FormDrawerProps) {
  const [formKey, setFormKey] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  return (
    <FarmDrawer open={open} onClose={onClose} size={size}>
      <Fragment key={formKey}>{children}</Fragment>
    </FarmDrawer>
  );
}
