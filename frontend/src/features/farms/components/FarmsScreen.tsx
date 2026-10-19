'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdAdd } from 'react-icons/md';
import { toast } from '@/ui/components/Toaster';
import type { CreatedFarm, Workspace } from '@/core/models/farm.model';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/ui/components/Button';
import { SectionHeader } from '@/ui/components/SectionHeader';
import { sortWorkspaces } from '../lib/farm-view';
import CreateFarmDrawer from './CreateFarmDrawer';
import FarmCard from './FarmCard';
import FarmsEmpty from './FarmsEmpty';
import FarmsStats from './FarmsStats';
import InviteMembersDrawer, { type InviteTarget } from './InviteMembersDrawer';

interface FarmsScreenProps {
  workspaces: Workspace[];
  viewer: 'Producer' | 'Professional';
  /** Llega con `?nuevo=1` (el "+" de "Mis campos" en el sidebar): el panel de alta arranca abierto. */
  startCreating?: boolean;
}

/**
 * Lista de campos. El productor crea campos e invita a su equipo; al crear uno, sigue directo a la invitación. El
 * profesional ve los campos donde lo sumaron.
 */
export default function FarmsScreen({
  workspaces,
  viewer,
  startCreating = false,
}: FarmsScreenProps) {
  const router = useRouter();
  const isProducer = viewer === 'Producer';
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState<InviteTarget | null>(null);

  // También cuando ya estaba en Campos y toca el "+" del sidebar (misma pantalla, cambia solo la URL).
  useEffect(() => {
    if (startCreating && isProducer) setCreating(true);
  }, [startCreating, isProducer]);

  const closeCreate = () => {
    setCreating(false);
    // Sin el `?nuevo=1`, recargar la página no vuelve a abrir el panel.
    if (startCreating) router.replace(ROUTES.farms, { scroll: false });
  };

  const created = (farm: CreatedFarm) => {
    closeCreate();
    toast.success(`Creaste ${farm.name}`, { description: `Su ID es ${farm.publicId}.` });
    router.refresh();
    setInviting({ farmId: farm.id, name: farm.name });
  };

  const closeInvite = () => {
    setInviting(null);
    router.refresh();
  };

  return (
    <>
      <SectionHeader
        as="h1"
        title="Campos"
        description={
          isProducer
            ? 'Tus campos y los profesionales que trabajan en cada uno.'
            : 'Los campos donde sos parte del equipo.'
        }
        actions={
          isProducer &&
          workspaces.length > 0 && (
            <Button type="button" size="lg" onClick={() => setCreating(true)}>
              <MdAdd data-icon="inline-start" size={18} aria-hidden />
              Nuevo campo
            </Button>
          )
        }
      />

      {workspaces.length > 0 && (
        <div className="mt-6">
          <FarmsStats workspaces={workspaces} />
        </div>
      )}

      <div className="mt-6">
        {workspaces.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortWorkspaces(workspaces).map((workspace) => (
              <li key={workspace.farmId} className="min-w-0">
                <FarmCard
                  workspace={workspace}
                  onInvite={
                    isProducer && workspace.archivedAt === null
                      ? () => setInviting({ farmId: workspace.farmId, name: workspace.name })
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <FarmsEmpty viewer={viewer} onCreate={isProducer ? () => setCreating(true) : undefined} />
        )}
      </div>

      {isProducer && (
        <>
          <CreateFarmDrawer open={creating} onClose={closeCreate} onCreated={created} />
          <InviteMembersDrawer target={inviting} onClose={closeInvite} />
        </>
      )}
    </>
  );
}
