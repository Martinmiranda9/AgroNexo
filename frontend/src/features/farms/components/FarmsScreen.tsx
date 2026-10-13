'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@phosphor-icons/react';
import { toast } from '@/ui/components/Toaster';
import type { CreatedFarm, Workspace } from '@/core/models/farm.model';
import { Button } from '@/ui/components/Button';
import { sortWorkspaces } from '../lib/farm-view';
import CreateFarmDrawer from './CreateFarmDrawer';
import FarmCard from './FarmCard';
import FarmsEmpty from './FarmsEmpty';
import InviteMembersDrawer, { type InviteTarget } from './InviteMembersDrawer';

interface FarmsScreenProps {
  workspaces: Workspace[];
  viewer: 'Producer' | 'Professional';
}

/**
 * Lista de campos. El productor crea campos e invita a su equipo; al crear uno, sigue directo a la invitación. El
 * profesional ve los campos donde lo sumaron.
 */
export default function FarmsScreen({ workspaces, viewer }: FarmsScreenProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState<InviteTarget | null>(null);
  const isProducer = viewer === 'Producer';

  const created = (farm: CreatedFarm) => {
    setCreating(false);
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-heading-lg tracking-heading text-pine">Campos</h1>
          <p className="text-body-sm text-olive mt-1">
            {isProducer
              ? 'Tus campos y los profesionales que trabajan en cada uno.'
              : 'Los campos donde sos parte del equipo.'}
          </p>
        </div>
        {isProducer && workspaces.length > 0 && (
          <Button type="button" size="lg" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" size={18} weight="bold" aria-hidden />
            Nuevo campo
          </Button>
        )}
      </div>

      <div className="mt-8">
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
          <CreateFarmDrawer
            open={creating}
            onClose={() => setCreating(false)}
            onCreated={created}
          />
          <InviteMembersDrawer target={inviting} onClose={closeInvite} />
        </>
      )}
    </>
  );
}
