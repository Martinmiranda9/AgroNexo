'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, UsersThreeIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { toast } from '@/ui/components/Toaster';
import { addFarmMemberAction } from '@/core/actions/add-farm-member.action';
import { getFarmCandidatesAction } from '@/core/actions/get-farm-candidates.action';
import type { AddFarmMemberResult, FarmCandidate } from '@/core/models/farm.model';
import type { ProfessionalRole } from '@/core/models/identity.model';
import { PROFESSIONAL_ROLE_FILTER_LABEL } from '@/shared/constants/roles';
import { ROUTES } from '@/shared/constants/routes';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/components/Drawer';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui/components/Empty';
import { Skeleton } from '@/ui/components/Skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/ui/components/ToggleGroup';
import { fullName } from '../lib/farm-view';
import CandidateItem from './CandidateItem';
import FarmDrawer, {
  DRAWER_BODY,
  DRAWER_FOOTER,
  DRAWER_HEADER,
  FarmDrawerCloseButton,
} from './FarmDrawer';

/** El campo al que se invita: lo justo para el título y la llamada. */
export interface InviteTarget {
  farmId: string;
  name: string;
}

const ALL = 'all';

type Load =
  | { state: 'loading' }
  | { state: 'ready'; candidates: FarmCandidate[] }
  | { state: 'error'; message: string };

type AddFailure = Exclude<AddFarmMemberResult['status'], 'added' | 'conflict'>;

const ADD_FAILURE_COPY: Record<AddFailure, string> = {
  invalid: 'No pudimos sumarlo: el match ya no está activo o el campo está archivado.',
  'not-found': 'Este campo o este profesional ya no existen.',
  unauthorized: 'Tu sesión venció. Volvé a ingresar para invitar.',
  unavailable: 'No pudimos sumarlo. Probá de nuevo en unos minutos.',
};

function LoadingList() {
  return (
    <ul aria-hidden className="flex flex-col gap-3">
      {[0, 1, 2].map((row) => (
        <li key={row}>
          <Skeleton className="rounded-card h-24 w-full" />
        </li>
      ))}
    </ul>
  );
}

function NoCandidates() {
  return (
    <Empty className="rounded-card border-pine/10 border border-solid py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-secondary text-pine size-11 rounded-full">
          <UsersThreeIcon size={22} aria-hidden />
        </EmptyMedia>
        <EmptyTitle className="text-body text-pine font-semibold">
          No hay profesionales para sumar
        </EmptyTitle>
        <EmptyDescription className="text-body-sm text-olive">
          Podés invitar a quienes aceptaron una solicitud tuya. Buscá un profesional y, cuando
          acepte, lo vas a ver acá.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          render={<Link href={ROUTES.matchDiscovery} />}
          nativeButton={false}
          variant="outline"
          size="lg"
        >
          <MagnifyingGlassIcon data-icon="inline-start" size={18} aria-hidden />
          Buscar un profesional
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function InvitePanel({ target, onDone }: { target: InviteTarget; onDone: () => void }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [role, setRole] = useState<string>(ALL);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFarmCandidatesAction(target.farmId).then((outcome) => {
      if (cancelled) return;
      if (outcome.status === 'ok') setLoad({ state: 'ready', candidates: outcome.candidates });
      else
        setLoad({
          state: 'error',
          message:
            outcome.status === 'unauthorized'
              ? 'Tu sesión venció. Volvé a ingresar para invitar.'
              : 'No pudimos cargar a tus profesionales. Probá de nuevo en unos minutos.',
        });
    });
    return () => {
      cancelled = true;
    };
  }, [target.farmId]);

  const invite = async (candidate: FarmCandidate) => {
    setFailure(null);
    setAddingId(candidate.professionalId);
    const outcome = await addFarmMemberAction(target.farmId, candidate.professionalId);
    setAddingId(null);

    if (outcome.status === 'added' || outcome.status === 'conflict') {
      setAdded((current) => new Set(current).add(candidate.professionalId));
      toast.success(`${fullName(candidate)} ya está en ${target.name}`);
      return;
    }
    setFailure(ADD_FAILURE_COPY[outcome.status]);
  };

  const candidates = load.state === 'ready' ? load.candidates : [];
  // El filtro muestra solo las profesiones que hay en la lista.
  const roles = [...new Set(candidates.map((c) => c.role))].filter(
    (r): r is Exclude<ProfessionalRole, 'Other'> => r in PROFESSIONAL_ROLE_FILTER_LABEL
  );
  const visible = role === ALL ? candidates : candidates.filter((c) => c.role === role);

  return (
    <>
      <DrawerHeader className={DRAWER_HEADER}>
        <DrawerTitle className="text-heading-sm tracking-heading text-pine pr-10">
          Invitar a {target.name}
        </DrawerTitle>
        <DrawerDescription className="text-body-sm text-dark">
          Estos son los profesionales que aceptaron una solicitud tuya. Los que sumes van a ver la
          información general del campo.
        </DrawerDescription>
        <FarmDrawerCloseButton />
      </DrawerHeader>

      <div className={DRAWER_BODY} aria-busy={load.state === 'loading'}>
        {load.state === 'loading' && <LoadingList />}

        {load.state === 'error' && (
          <Alert variant="destructive" role="alert">
            <WarningCircleIcon aria-hidden />
            <AlertDescription>{load.message}</AlertDescription>
          </Alert>
        )}

        {load.state === 'ready' && candidates.length === 0 && <NoCandidates />}

        {load.state === 'ready' && candidates.length > 0 && (
          <>
            {roles.length > 1 && (
              <div className="-mx-6 overflow-x-auto px-6">
                <ToggleGroup
                  aria-label="Profesión"
                  variant="segmented"
                  spacing={2}
                  value={[role]}
                  onValueChange={(next) => {
                    // Tocar la opción activa la desmarcaría: siempre queda una elegida.
                    if (next[0]) setRole(next[0]);
                  }}
                  className="w-max"
                >
                  <ToggleGroupItem value={ALL}>Todos</ToggleGroupItem>
                  {roles.map((r) => (
                    <ToggleGroupItem key={r} value={r}>
                      {PROFESSIONAL_ROLE_FILTER_LABEL[r]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}

            {failure && (
              <Alert variant="destructive" role="alert">
                <WarningCircleIcon aria-hidden />
                <AlertDescription>{failure}</AlertDescription>
              </Alert>
            )}

            <ul aria-label="Profesionales para invitar" className="flex flex-col gap-3">
              {visible.map((candidate) => (
                <li key={candidate.professionalId}>
                  <CandidateItem
                    candidate={candidate}
                    added={added.has(candidate.professionalId)}
                    adding={addingId === candidate.professionalId}
                    disabled={addingId !== null}
                    onInvite={() => invite(candidate)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <DrawerFooter className={DRAWER_FOOTER}>
        <Button type="button" size="lg" onClick={onDone} disabled={addingId !== null}>
          {added.size > 0 ? 'Listo' : 'Cerrar'}
        </Button>
      </DrawerFooter>
    </>
  );
}

interface InviteMembersDrawerProps {
  /** Campo al que se invita; `null` cierra el panel. */
  target: InviteTarget | null;
  onClose: () => void;
}

/**
 * Invitación al equipo de un campo: la lista de profesionales con match aceptado que todavía no están, con filtro por
 * profesión, y un botón "Invitar" por cada uno. Sumar es inmediato: el profesional ya aceptó trabajar con el productor.
 */
export default function InviteMembersDrawer({ target, onClose }: InviteMembersDrawerProps) {
  // Mientras se anima el cierre `target` ya es null: se sigue mostrando el último.
  const [shown, setShown] = useState(target);
  if (target && target !== shown) setShown(target);
  const view = target ?? shown;

  // Cada apertura vuelve a pedir la lista: lo que se sumó la vez anterior ya no aparece.
  const open = target !== null;
  const [openCount, setOpenCount] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOpenCount((count) => count + 1);
  }

  return (
    <FarmDrawer open={open} onClose={onClose}>
      {view && <InvitePanel key={`${view.farmId}-${openCount}`} target={view} onDone={onClose} />}
    </FarmDrawer>
  );
}
