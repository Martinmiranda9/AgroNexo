import type { ReactNode } from 'react';
import type { Match } from '@/core/models/match.model';
import { MATCH_STATUS_BADGE, MATCH_STATUS_LABEL } from '@/shared/constants/match-status';
import ContactCard from '@/ui/components/ContactCard';
import NeedBriefCard from '@/ui/components/NeedBriefCard';
import { briefOf, relativeTime } from '../lib/match-view';
import MatchRequestActions from './MatchRequestActions';

interface MatchRequestCardProps {
  match: Match;
  /** Quién mira: el profesional ve al productor y puede responder; el productor ve al profesional. */
  viewer: 'Producer' | 'Professional';
  /** Acción extra bajo el contacto cuando el match está aceptado. */
  activeAction?: ReactNode;
}

/** Una solicitud de match con su ficha de necesidad. Solo el profesional puede responder, y solo si sigue pendiente. */
export default function MatchRequestCard({ match, viewer, activeAction }: MatchRequestCardProps) {
  const asProfessional = viewer === 'Professional';
  const canRespond = asProfessional && match.status === 'Pending';
  // Con el match activo, cada parte recibe el contacto de la otra; el backend no lo manda en ningún otro caso.
  const contact =
    match.status === 'Active'
      ? asProfessional
        ? match.producerContact
        : match.professionalContact
      : null;
  const contactName = asProfessional ? match.producerName : match.professionalName;

  return (
    <NeedBriefCard
      counterpartName={asProfessional ? match.producerName : match.professionalName}
      counterpartCaption={asProfessional ? 'Productor' : match.specialty}
      brief={briefOf(match)}
      statusLabel={MATCH_STATUS_LABEL[match.status]}
      statusVariant={MATCH_STATUS_BADGE[match.status]}
      requestedAt={relativeTime(match.requestedAt)}
      footer={
        canRespond ? (
          <MatchRequestActions matchId={match.id} requesterName={match.producerName} />
        ) : contact ? (
          <div className="flex flex-col gap-4">
            <ContactCard
              name={contactName}
              phoneNumber={contact.phoneNumber}
              email={contact.email}
            />
            {activeAction}
          </div>
        ) : undefined
      }
    />
  );
}
