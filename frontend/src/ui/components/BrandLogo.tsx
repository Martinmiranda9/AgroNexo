import Link from 'next/link';
import { Sprout } from 'lucide-react';

/** Isotipo + nombre de AgroNexo; siempre enlaza al inicio. */
export default function BrandLogo() {
  return (
    <Link href="/" aria-label="AgroNexo — Inicio" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-pine/15 bg-beige transition-colors group-hover:border-pine/35">
        <Sprout className="h-[18px] w-[18px] text-primary" strokeWidth={1.75} />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-pine">AgroNexo</span>
    </Link>
  );
}
