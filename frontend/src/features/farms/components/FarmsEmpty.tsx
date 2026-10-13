import { FarmIcon, PlusIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/ui/components/Button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui/components/Empty';

const COPY = {
  Producer: {
    title: 'Todavía no creaste ningún campo',
    description:
      'Creá un campo para sumar a los profesionales con los que hiciste match. Cada uno va a tener su espacio con vos.',
  },
  Professional: {
    title: 'Todavía no estás en ningún campo',
    description: 'Cuando un productor te sume al equipo de uno de sus campos, lo vas a ver acá.',
  },
} as const;

interface FarmsEmptyProps {
  viewer: 'Producer' | 'Professional';
  /** Solo para el productor. */
  onCreate?: () => void;
}

/** Lista de campos vacía. Al productor le da el camino directo a crear el primero. */
export default function FarmsEmpty({ viewer, onCreate }: FarmsEmptyProps) {
  const { title, description } = COPY[viewer];

  return (
    <Empty className="rounded-shell border-pine/10 bg-surface border border-solid py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-secondary text-pine size-11 rounded-full">
          <FarmIcon size={22} aria-hidden />
        </EmptyMedia>
        <EmptyTitle className="text-body text-pine font-semibold">{title}</EmptyTitle>
        <EmptyDescription className="text-body-sm text-olive">{description}</EmptyDescription>
      </EmptyHeader>
      {onCreate && (
        <EmptyContent>
          <Button type="button" size="lg" onClick={onCreate}>
            <PlusIcon data-icon="inline-start" size={18} weight="bold" aria-hidden />
            Crear mi primer campo
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
