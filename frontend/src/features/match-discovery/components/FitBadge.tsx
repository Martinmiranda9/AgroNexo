import { Badge, BadgeDot } from '@/ui/components/Badge';
import type { Fit } from '../lib/build-results';

/** "Encaja" cuando coincide con lo pedido y tiene lugar; "Podría encajar" cuando falta confirmar algo. */
export default function FitBadge({ fit }: { fit: Fit }) {
  return fit === 'fits' ? (
    <Badge variant="success">
      <BadgeDot />
      Encaja
    </Badge>
  ) : (
    <Badge variant="warning">
      <BadgeDot />
      Podría encajar
    </Badge>
  );
}
