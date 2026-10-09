import { CheckIcon, QuestionIcon } from '@phosphor-icons/react/dist/ssr';

interface ReasonListProps {
  /** Lo que cumple, una línea cada uno. */
  checks: string[];
  /** Lo que conviene preguntarle antes de decidir. */
  missing: string[];
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Por qué aparece: lo que cumple (✓) y lo que conviene consultarle, en listas fáciles de recorrer. */
export default function ReasonList({ checks, missing }: ReasonListProps) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2.5">
        {checks.map((check) => (
          <li key={check} className="text-body-sm text-pine flex items-start gap-2.5">
            <span className="bg-fill-positive mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
              <CheckIcon size={12} weight="bold" aria-hidden />
            </span>
            {check}
          </li>
        ))}
      </ul>

      {missing.length > 0 && (
        <div className="bg-fill-caution rounded-lg px-4 py-3">
          <p className="text-body-sm text-pine font-semibold">Para consultarle</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {missing.map((item) => (
              <li key={item} className="text-body-sm text-dark flex items-start gap-2">
                <QuestionIcon size={16} className="text-olive mt-0.5 shrink-0" aria-hidden />
                {capitalize(item)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
