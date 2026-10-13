'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@phosphor-icons/react';
import { toast } from '@/ui/components/Toaster';
import type { CreatedFarm } from '@/core/models/farm.model';
import { Button } from '@/ui/components/Button';
import CreateFarmDrawer from './CreateFarmDrawer';
import InviteMembersDrawer, { type InviteTarget } from './InviteMembersDrawer';

interface NewFarmButtonProps {
  /** Quien lo ubica ajusta el aspecto al fondo (por ejemplo, la barra lateral en pine). */
  className?: string;
}

/**
 * Atajo para crear un campo desde cualquier pantalla, haya match o no. Igual que en la lista de campos, al crearlo sigue
 * directo a invitar al equipo.
 */
export default function NewFarmButton({ className }: NewFarmButtonProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState<InviteTarget | null>(null);

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
      <Button type="button" size="lg" className={className} onClick={() => setCreating(true)}>
        <PlusIcon data-icon="inline-start" size={18} weight="bold" aria-hidden />
        Nuevo campo
      </Button>

      <CreateFarmDrawer open={creating} onClose={() => setCreating(false)} onCreated={created} />
      <InviteMembersDrawer target={inviting} onClose={closeInvite} />
    </>
  );
}
