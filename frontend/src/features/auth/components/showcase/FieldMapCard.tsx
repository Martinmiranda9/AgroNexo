import Image from 'next/image';
import { MapPin } from '@phosphor-icons/react';
import { Badge, BadgeDot, Card } from '@/ui/components';
import IconContainer from '@/ui/components/IconContainer';

// Dimensiones de la foto: el SVG de encima usa el mismo viewBox, así el lote queda alineado a cualquier ancho.
const PHOTO_W = 1566;
const PHOTO_H = 803;

/**
 * Vista aérea de un conjunto de campos con el lote seleccionado marcado encima.
 * Datos de ejemplo: ilustran el producto, no salen de la API.
 *
 * TODO: la foto (`lote-aerial.webp`) es un placeholder con marca de agua; reemplazar por una imagen con licencia libre.
 */
export default function FieldMapCard() {
  return (
    <Card surface="onDark" className="shadow-2xl shadow-pine/40">
      <div className="flex items-center gap-3 px-4 pb-2.5 pt-3.5">
        <IconContainer size="md">
          <MapPin size={18} weight="regular" />
        </IconContainer>
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold tracking-heading">Lote 14 · Soja de 1ra</p>
          <p className="mt-0.5 text-caption text-dark/70">
            <span className="font-mono tabular-nums">82</span> ha · Venado Tuerto, Santa Fe
          </p>
        </div>
        <Badge variant="success">
          <BadgeDot />
          NDVI <span className="font-mono tabular-nums">0,78</span>
        </Badge>
      </div>

      <div className="relative mx-2.5 mb-2.5 overflow-hidden rounded-lg">
        <Image
          src="/images/showcase/lote-aerial.webp"
          alt=""
          width={PHOTO_W}
          height={PHOTO_H}
          sizes="380px"
          className="block h-auto w-full"
        />
        <svg
          viewBox={`0 0 ${PHOTO_W} ${PHOTO_H}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <polygon
            points="645,458 770,362 920,515 745,630"
            className="fill-beige/15 stroke-beige"
            strokeWidth="11"
            strokeDasharray="28 20"
            strokeLinejoin="round"
          />
          <g transform="translate(775 490)">
            <circle r="52" className="fill-beige/25">
              <animate attributeName="r" values="44;100;44" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle r="28" className="fill-beige" />
            <circle r="12" className="fill-pine" />
          </g>
        </svg>
      </div>
    </Card>
  );
}
