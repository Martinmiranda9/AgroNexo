import type { SVGProps } from 'react';

/**
 * Isotipo AgroNexo (Figma «Agronexo. Branding logos», viewBox 200×200).
 * `variant` indica la superficie donde se apoya, no el color del logo:
 *  - light: fondo claro/beige  → trazo pine #00311E, punto dorado.
 *  - dark: fondo verde/oscuro  → trazo crema #FEF7E5, punto verde claro.
 *  - monochrome: una sola tinta pine #00311E (impresión, sellos, un color).
 * Con `tile` se dibuja dentro del cuadrado redondeado: en superficie clara usa
 * el tile pine (crema sobre pine); en superficie oscura, el tile crema.
 */
export type BrandMarkVariant = 'light' | 'dark' | 'monochrome';

interface BrandMarkProps extends Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'children'> {
  variant?: BrandMarkVariant;
  tile?: boolean;
}

const PINE = '#00311E';
const CREAM = '#FEF7E5';

type Palette = { tile: string; dot: string; stem: string; leafL: string; leafR: string };

const MARK: Record<BrandMarkVariant, Palette> = {
  light: { tile: 'none', dot: '#978A56', stem: PINE, leafL: PINE, leafR: PINE },
  dark: { tile: 'none', dot: '#99A474', stem: CREAM, leafL: CREAM, leafR: CREAM },
  monochrome: { tile: 'none', dot: PINE, stem: PINE, leafL: PINE, leafR: PINE },
};

const TILE: Record<BrandMarkVariant, Palette> = {
  light: { tile: PINE, dot: '#978A56', stem: CREAM, leafL: CREAM, leafR: CREAM },
  dark: { tile: '#FFF3D5', dot: '#978A56', stem: PINE, leafL: PINE, leafR: '#4D694E' },
  monochrome: { tile: PINE, dot: CREAM, stem: CREAM, leafL: CREAM, leafR: CREAM },
};

export default function BrandMark({
  variant = 'light',
  tile = false,
  role,
  'aria-label': ariaLabel,
  ...props
}: BrandMarkProps) {
  const p = (tile ? TILE : MARK)[variant];
  const decorative = !ariaLabel;

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : (role ?? 'img')}
      aria-label={ariaLabel}
      aria-hidden={decorative || undefined}
      {...props}
    >
      {tile && <rect width="200" height="200" rx="40" fill={p.tile} />}
      <circle cx="100" cy="48" r="13" fill={p.dot} />
      <path d="M100 70V155" stroke={p.stem} strokeWidth="9" strokeLinecap="round" />
      <path d="M100 110C75 105 62 88 60 65C85 68 100 85 100 110Z" fill={p.leafL} />
      <path d="M100 110C125 105 138 88 140 65C115 68 100 85 100 110Z" fill={p.leafR} />
    </svg>
  );
}
