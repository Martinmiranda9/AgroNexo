import { EnvelopeSimpleIcon, PhoneIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from './Button';

export interface ContactCardProps {
  /** A quién se le escribe: "Martín Miranda". */
  name: string;
  /** Teléfono en formato internacional (`+5491155550000`). */
  phoneNumber: string;
  email?: string | null;
}

/** `+54 9 11 5555 0000` → `5491155550000`, lo que pide el enlace de WhatsApp. */
const digitsOf = (phone: string) => phone.replace(/\D/g, '');

/**
 * Datos de contacto de la contraparte de un match activo: el teléfono y el correo como texto (para copiarlos) y
 * accesos directos para escribir por WhatsApp, llamar o mandar un correo.
 */
export default function ContactCard({ name, phoneNumber, email }: ContactCardProps) {
  const digits = digitsOf(phoneNumber);

  return (
    <section aria-label={`Contacto de ${name}`} className="flex flex-col gap-3">
      <h4 className="text-body-sm text-pine font-semibold">Contacto de {name}</h4>

      <dl className="text-body-sm text-dark flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Teléfono</dt>
          <PhoneIcon size={16} className="text-olive shrink-0" aria-hidden />
          <dd className="font-mono select-all">{phoneNumber}</dd>
        </div>
        {email && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Correo</dt>
            <EnvelopeSimpleIcon size={16} className="text-olive shrink-0" aria-hidden />
            <dd className="min-w-0 break-all select-all">{email}</dd>
          </div>
        )}
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button
          render={<a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" />}
          nativeButton={false}
        >
          <WhatsappLogoIcon data-icon="inline-start" size={18} aria-hidden />
          Escribir por WhatsApp
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </Button>
        <Button render={<a href={`tel:${phoneNumber}`} />} nativeButton={false} variant="outline">
          <PhoneIcon data-icon="inline-start" size={18} aria-hidden />
          Llamar
        </Button>
        {email && (
          <Button render={<a href={`mailto:${email}`} />} nativeButton={false} variant="outline">
            <EnvelopeSimpleIcon data-icon="inline-start" size={18} aria-hidden />
            Correo
          </Button>
        )}
      </div>
    </section>
  );
}
