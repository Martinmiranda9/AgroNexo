import Link from 'next/link';
import BrandMark, { type BrandMarkVariant } from './BrandMark';

interface BrandLogoProps {
  /** Superficie donde se apoya: light = fondo claro, dark = fondo verde/oscuro. */
  variant?: Exclude<BrandMarkVariant, 'monochrome'>;
}

const WORDMARK: Record<NonNullable<BrandLogoProps['variant']>, string> = {
  light: 'text-pine',
  dark: 'text-beige',
};

/** Isotipo + nombre de AgroNexo; siempre enlaza al inicio. */
export default function BrandLogo({ variant = 'light' }: BrandLogoProps) {
  return (
    <Link href="/" aria-label="AgroNexo — Inicio" className="flex items-center gap-2.5">
      <BrandMark variant={variant} tile className="h-9 w-9 shrink-0" />
      <span className={`text-[17px] font-semibold tracking-tight ${WORDMARK[variant]}`}>AgroNexo</span>
    </Link>
  );
}
