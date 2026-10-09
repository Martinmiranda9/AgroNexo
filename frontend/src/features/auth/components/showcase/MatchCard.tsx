import { ArrowUpRight, MapPin, SealCheck } from '@phosphor-icons/react';
import { Badge, Card } from '@/ui/components';
import Avatar from '@/ui/components/Avatar';
import IconContainer from '@/ui/components/IconContainer';

/** Perfil profesional recomendado con su afinidad. Datos de ejemplo. */
export default function MatchCard() {
  return (
    <Card surface="onDark" coreClassName="p-4" className="shadow-2xl shadow-pine/40">
      <div className="flex items-center gap-3">
        <Avatar initials="MR" size="md" />
        <div className="min-w-0">
          <p className="truncate text-body-sm font-semibold tracking-heading">Ing. Agr. Marcos Ruiz</p>
          <p className="mt-0.5 truncate text-caption text-dark/70">Asesor de cultivos</p>
        </div>
      </div>

      <div className="mb-1.5 mt-4 flex items-baseline justify-between text-caption">
        <span className="text-dark/70">Afinidad con tu campo</span>
        <b className="font-mono text-body-sm font-semibold tabular-nums">98%</b>
      </div>
      <div className="h-1.5 overflow-hidden rounded-pill bg-pine/10">
        <div className="h-full w-[98%] rounded-pill bg-olive" />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge variant="success">
          <SealCheck data-icon="inline-start" size={12} weight="fill" />
          Verificado
        </Badge>
        <Badge variant="secondary">
          <MapPin data-icon="inline-start" size={12} weight="bold" />
          Rosario
        </Badge>
        <IconContainer size="sm" tone="solid" className="ml-auto">
          <ArrowUpRight size={14} weight="bold" />
        </IconContainer>
      </div>
    </Card>
  );
}
