import Link from 'next/link';
import { MdOutlineInbox, MdSearch } from 'react-icons/md';
import { ROUTES } from '@/shared/constants/routes';
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

interface MatchRequestsEmptyProps {
  viewer: 'Producer' | 'Professional';
}

const COPY = {
  Professional: {
    title: 'Todavía no recibiste solicitudes',
    description:
      'Cuando un productor te elija, vas a ver acá lo que necesita: la zona, las hectáreas, la urgencia y los temas.',
  },
  Producer: {
    title: 'Todavía no enviaste solicitudes',
    description:
      'Buscá un profesional y solicitale el match: va a recibir la ficha con lo que necesitás.',
  },
} as const;

/** Estado vacío de la lista de solicitudes. Al productor le da el camino directo a buscar. */
export default function MatchRequestsEmpty({ viewer }: MatchRequestsEmptyProps) {
  const { title, description } = COPY[viewer];

  return (
    <Card>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MdOutlineInbox aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {viewer === 'Producer' && (
          <EmptyContent>
            <Button render={<Link href={ROUTES.matchDiscovery} />} nativeButton={false} size="lg">
              <MdSearch data-icon="inline-start" size={18} aria-hidden />
              Buscar un profesional
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </Card>
  );
}
