import { MdAdd, MdOutlineAgriculture } from 'react-icons/md';
import { Button } from '@/ui/components/Button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui/components/Empty';
import { Card } from '@/ui/components/Card';

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
    <Card>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MdOutlineAgriculture aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {onCreate && (
          <EmptyContent>
            <Button type="button" size="lg" onClick={onCreate}>
              <MdAdd data-icon="inline-start" size={18} aria-hidden />
              Crear mi primer campo
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </Card>
  );
}
