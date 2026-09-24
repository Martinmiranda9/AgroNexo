import { MapPin } from '@phosphor-icons/react';
import { Badge, Card } from '@/ui/components';
import IconContainer from '@/ui/components/IconContainer';

/**
 * Mapa esquemático de un lote con capa de vigor (NDVI), en la escala Pine → Oliva → Salvia → Cálido.
 * Datos de ejemplo: ilustran el producto, no salen de la API.
 */
export default function FieldMapCard() {
  return (
    <Card surface="onDark" className="shadow-2xl shadow-pine/40">
      <div className="flex items-center gap-3 px-4 pb-2.5 pt-3.5">
        <IconContainer size="md">
          <MapPin size={18} weight="regular" />
        </IconContainer>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight tracking-tight">Lote 14 · Soja de 1ra</p>
          <p className="mt-0.5 text-[11px] text-dark/70">
            <span className="font-mono tabular-nums">82</span> ha · Venado Tuerto, Santa Fe
          </p>
        </div>
        <Badge variant="positive" dot>
          NDVI <span className="font-mono tabular-nums">0,78</span>
        </Badge>
      </div>

      <svg
        viewBox="0 0 392 210"
        preserveAspectRatio="xMidYMid slice"
        className="mx-2.5 mb-2.5 block h-[150px] w-[calc(100%-20px)] rounded-xl"
        aria-hidden="true"
      >
        <rect width="392" height="210" className="fill-pine" />
        <polygon points="8,14 120,8 132,84 14,92" className="fill-accent-mid" />
        <polygon points="126,8 250,16 240,90 138,84" className="fill-primary" />
        <polygon points="256,16 384,10 380,96 246,92" className="fill-accent-light" />
        <polygon points="14,98 132,92 140,170 20,196" className="fill-primary" />
        <polygon
          points="146,92 240,96 246,178 152,172"
          className="fill-accent-mid stroke-beige"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
        <polygon points="252,98 380,102 376,198 258,182" className="fill-accent-light" />
        <polygon points="300,120 360,124 356,176 306,170" className="fill-neutral-warm" />
        <path d="M0 200 Q120 170 392 205" className="stroke-beige/30" strokeWidth="3" fill="none" />
        <g transform="translate(196 134)">
          <circle r="16" className="fill-beige/25">
            <animate attributeName="r" values="12;24;12" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="7" className="fill-beige" />
          <circle r="3" className="fill-pine" />
        </g>
      </svg>
    </Card>
  );
}
