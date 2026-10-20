'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdAdd, MdCheck, MdErrorOutline, MdOutlineAgriculture } from 'react-icons/md';
import { toast } from '@/ui/components/Toaster';
import { addFarmMemberAction } from '@/core/actions/add-farm-member.action';
import type { CreatedFarm, Workspace } from '@/core/models/farm.model';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/components/Drawer';
import IconContainer from '@/ui/components/IconContainer';
import { Item, ItemActions, ItemContent, ItemMedia } from '@/ui/components/Item';
import { hectaresLabel } from '../lib/farm-view';
import CreateFarmDrawer from './CreateFarmDrawer';
import FarmDrawer, {
  DRAWER_BODY,
  DRAWER_FOOTER,
  DRAWER_HEADER,
  FarmDrawerCloseButton,
} from './FarmDrawer';

const FAILURE_COPY = 'No pudimos sumarlo. Probá de nuevo en unos minutos.';

interface FarmRowProps {
  farm: Workspace;
  member: boolean;
  adding: boolean;
  disabled: boolean;
  onAdd: () => void;
}

function FarmRow({ farm, member, adding, disabled, onAdd }: FarmRowProps) {
  const titleId = useId();
  const hectares = hectaresLabel(farm.totalHectares);

  return (
    <Item
      render={<article aria-labelledby={titleId} />}
      variant="outline"
      className="flex-nowrap items-center"
    >
      <ItemMedia>
        <IconContainer>
          <MdOutlineAgriculture size={18} aria-hidden />
        </IconContainer>
      </ItemMedia>
      <ItemContent className="min-w-0 gap-0">
        <h3
          id={titleId}
          className="text-body tracking-heading text-foreground truncate font-semibold"
        >
          {farm.name}
        </h3>
        <p className="text-caption text-muted-foreground font-medium">
          ID <span className="font-mono">{farm.publicId}</span>
          {hectares && (
            <>
              {' · '}
              <span className="font-mono">{hectares}</span>
            </>
          )}
        </p>
      </ItemContent>
      <ItemActions>
        {member ? (
          <Badge variant="success">
            <MdCheck data-icon="inline-start" aria-hidden />
            En el equipo
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onAdd}
            disabled={disabled}
            loading={adding}
            loadingText="Sumando…"
            aria-describedby={titleId}
          >
            Sumar
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}

interface AddToFarmButtonProps {
  professionalId: string;
  professionalName: string;
  /** Campos del productor (los archivados no se ofrecen). */
  farms: Workspace[];
}

/**
 * Atajo desde un match aceptado: sumar a ese profesional al equipo de uno de los campos, o crear uno nuevo y sumarlo
 * ahí mismo.
 */
export default function AddToFarmButton({
  professionalId,
  professionalName,
  farms,
}: AddToFarmButtonProps) {
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addedTo, setAddedTo] = useState<Set<string>>(() => new Set());
  const [failure, setFailure] = useState<string | null>(null);

  const usable = farms.filter((farm) => farm.archivedAt === null);
  const isMember = (farm: Workspace) =>
    addedTo.has(farm.farmId) || farm.members.some((m) => m.professionalId === professionalId);

  const add = async (farmId: string, farmName: string) => {
    setFailure(null);
    setAddingTo(farmId);
    const outcome = await addFarmMemberAction(farmId, professionalId);
    setAddingTo(null);

    if (outcome.status === 'added' || outcome.status === 'conflict') {
      setAddedTo((current) => new Set(current).add(farmId));
      toast.success(`${professionalName} ya está en ${farmName}`);
      router.refresh();
      return true;
    }
    setFailure(FAILURE_COPY);
    return false;
  };

  const createdAndAdd = async (farm: CreatedFarm) => {
    setCreating(false);
    const ok = await add(farm.id, farm.name);
    if (!ok) toast.error(`Creamos ${farm.name}, pero no pudimos sumar a ${professionalName}`);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => setPicking(true)}
      >
        <MdOutlineAgriculture data-icon="inline-start" size={16} aria-hidden />
        Sumar a un campo
      </Button>

      <FarmDrawer open={picking} onClose={() => setPicking(false)}>
        <DrawerHeader className={DRAWER_HEADER}>
          <DrawerTitle className="pr-10">Sumar a {professionalName} a un campo</DrawerTitle>
          <DrawerDescription>
            Va a ver la información general del campo y su propia sección con vos.
          </DrawerDescription>
          <FarmDrawerCloseButton />
        </DrawerHeader>

        <div className={DRAWER_BODY}>
          {usable.length === 0 ? (
            <p className="text-body-sm text-sage-800">
              Todavía no tenés campos. Creá uno y lo sumamos ahí.
            </p>
          ) : (
            <ul aria-label="Tus campos" className="flex flex-col gap-3">
              {usable.map((farm) => (
                <li key={farm.farmId}>
                  <FarmRow
                    farm={farm}
                    member={isMember(farm)}
                    adding={addingTo === farm.farmId}
                    disabled={addingTo !== null}
                    onAdd={() => add(farm.farmId, farm.name)}
                  />
                </li>
              ))}
            </ul>
          )}

          {failure && (
            <Alert variant="destructive" role="alert">
              <MdErrorOutline aria-hidden />
              <AlertDescription>{failure}</AlertDescription>
            </Alert>
          )}
        </div>

        <DrawerFooter className={DRAWER_FOOTER}>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setPicking(false);
              setCreating(true);
            }}
            disabled={addingTo !== null}
          >
            <MdAdd data-icon="inline-start" size={16} aria-hidden />
            Crear un campo nuevo
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={() => setPicking(false)}
            disabled={addingTo !== null}
          >
            Listo
          </Button>
        </DrawerFooter>
      </FarmDrawer>

      <CreateFarmDrawer
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={createdAndAdd}
        submitLabel={`Crear y sumar a ${professionalName.split(' ')[0]}`}
      />
    </>
  );
}
