import Link from 'next/link';
import BrandMark, { type BrandMarkVariant } from './BrandMark';

interface BrandLogoProps {
  /** Superficie donde se apoya: light = fondo claro, dark = fondo verde/oscuro. */
  variant?: Exclude<BrandMarkVariant, 'monochrome'>;
  /** En celular queda solo el isotipo (el nombre sigue para el lector de pantalla). */
  compactOnMobile?: boolean;
  /** Bajada chica debajo del nombre (en el sidebar: el espacio del usuario, como en la referencia). */
  caption?: string;
}

const WORDMARK: Record<NonNullable<BrandLogoProps['variant']>, string> = {
  light: 'text-pine',
  dark: 'text-sage-50',
};

const CAPTION: Record<NonNullable<BrandLogoProps['variant']>, string> = {
  light: 'text-muted-foreground',
  dark: 'text-sage-50/70',
};

/**
 * Isotipo + nombre de AgroNexo, sin contenedor ni borde; siempre enlaza al inicio. Dentro del sidebar colapsado queda
 * solo el isotipo.
 */
export default function BrandLogo({
  variant = 'light',
  compactOnMobile = false,
  caption,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="AgroNexo — Inicio"
      className="focus-visible:ring-ring/50 flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3"
    >
      <BrandMark variant={variant} tile className="h-9 w-9 shrink-0" />
      <span
        className={`flex min-w-0 flex-col group-data-[collapsed=true]/sidebar:sr-only ${compactOnMobile ? 'max-sm:sr-only' : ''}`}
      >
        <span
          className={`text-body tracking-heading leading-tight font-semibold ${WORDMARK[variant]}`}
        >
          AgroNexo
        </span>
        {caption && <span className={`text-caption truncate ${CAPTION[variant]}`}>{caption}</span>}
      </span>
    </Link>
  );
}
