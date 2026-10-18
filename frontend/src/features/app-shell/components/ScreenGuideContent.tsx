import { PopoverDescription, PopoverHeader, PopoverTitle } from '@/ui/components/Popover';
import { guideFor } from '../navigation';

/** Guía corta de la pantalla actual, para el ícono de información y "Ayuda" del sidebar. El contacto de soporte se
 *  suma cuando exista. */
export default function ScreenGuideContent({ pathname }: { pathname: string }) {
  const guide = guideFor(pathname);
  return (
    <>
      <PopoverHeader>
        <PopoverTitle>{guide.title}</PopoverTitle>
        <PopoverDescription>Cómo usar esta pantalla</PopoverDescription>
      </PopoverHeader>
      <ol className="text-foreground flex list-decimal flex-col gap-1.5 pl-4">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </>
  );
}
