'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CaretLeft, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { Button, Spinner } from '@/ui/components';
import type { RegistrationAccount, RegistrationKind } from '../config/types';
import { useRegistrationWizard } from '../hooks/useRegistrationWizard';
import AccountStep from './AccountStep';
import OnboardingHeader from './OnboardingHeader';
import PreviewPanel from './PreviewPanel';
import RoleStep from './RoleStep';
import StepFields from './StepFields';

const EASE = [0.16, 1, 0.3, 1] as const;
const TITLE_ID = 'onboarding-step-title';

/**
 * Registro multipaso. El paso 1 es la elección de rol; el resto sale de `config/flows.ts`,
 * por lo que todos los roles comparten UI y lógica. El encabezado es fijo; cambian título y contenido.
 */
export default function RegistrationWizard({
  initialKind,
  account,
  requiresAccount = false,
}: {
  initialKind?: RegistrationKind;
  /** Cuenta ya autenticada: prellena nombre, apellido y correo y registra con su sesión. */
  account?: RegistrationAccount;
  /** Sin sesión y con Firebase activo: el wizard empieza con el paso "Tu cuenta" (Google o correo y contraseña). */
  requiresAccount?: boolean;
}) {
  const reduce = useReducedMotion();
  const {
    kind,
    flow,
    step,
    stepIndex,
    displayStep,
    displayTotal,
    isAccountStep,
    isRoleStep,
    isLastStep,
    values,
    errors,
    preview,
    submitting,
    submitError,
    selectKind,
    updateValues,
    next,
    back,
  } = useRegistrationWizard(initialKind, account, requiresAccount);

  // Al cambiar de paso el foco pasa al título nuevo: el lector de pantalla anuncia el paso y el teclado
  // no queda varado en un botón "Continuar" que ya cambió de contexto. Se hace con un ref de callback
  // (corre al montar el h1 nuevo, no durante la salida del viejo) y se omite en el primer render.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);
  const focusTitle = useCallback((el: HTMLHeadingElement | null) => {
    if (el && mounted.current) el.focus({ preventScroll: true });
  }, []);

  return (
    <main className="bg-bg-card text-pine flex min-h-[100dvh] w-full flex-col md:flex-row">
      <section className="flex min-h-[100dvh] w-full flex-col px-6 pt-8 pb-8 sm:px-12 md:w-[46%] md:px-12 lg:px-16">
        {/* Bloque centrado en vertical. La altura mínima es la del paso más alto (rol), así el header
            y los botones no se mueven al pasar entre pasos de distinto largo. */}
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center">
          <div className="flex flex-col md:min-h-[670px]">
            <OnboardingHeader current={displayStep} total={displayTotal} />

            {account?.email && (
              <p className="border-pine/10 bg-beige text-olive mt-6 flex flex-wrap items-center gap-x-1.5 rounded-lg border px-3.5 py-2.5 text-body-sm">
                <CheckCircle size={16} weight="fill" className="text-olive shrink-0" />
                <span>
                  Cuenta {account.provider === 'google.com' ? 'de Google' : ''}{' '}
                  <strong className="text-pine font-semibold">{account.email}</strong>
                </span>
                <a
                  href={`/api/auth/logout?returnTo=${encodeURIComponent('/onboarding')}`}
                  className="text-pine ml-auto py-1.5 font-semibold underline underline-offset-4"
                >
                  Cambiar
                </a>
              </p>
            )}

            <div className="mt-8 flex flex-1 flex-col lg:mt-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <h1
                    ref={focusTitle}
                    id={TITLE_ID}
                    tabIndex={-1}
                    className="text-heading-md tracking-heading outline-none"
                  >
                    {step.title}
                  </h1>
                  <p className="text-olive mt-2 text-body-sm">{step.subtitle}</p>
                </motion.div>
              </AnimatePresence>

              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
                className="mt-7 flex flex-1 flex-col gap-6"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step.id}
                    initial={reduce ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    {isAccountStep ? (
                      <AccountStep />
                    ) : isRoleStep ? (
                      <RoleStep value={kind} onChange={selectKind} labelledBy={TITLE_ID} />
                    ) : (
                      <StepFields
                        fields={step.fields}
                        values={values}
                        errors={errors}
                        onChange={updateValues}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {submitError && (
                  <p
                    role="alert"
                    className="border-danger/30 bg-danger/5 text-danger flex items-start gap-2 rounded-lg border px-3.5 py-3 text-body-sm"
                  >
                    <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
                    {submitError}
                  </p>
                )}

                {/* El paso de cuenta tiene sus propios botones (Google / correo, cada uno abre un popup);
                    no hay nada que "continuar" acá hasta que termine y la página se recargue con sesión. */}
                {!isAccountStep && (
                  <div className="mt-auto flex gap-3">
                    {stepIndex > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        aria-label="Volver al paso anterior"
                        onClick={back}
                        disabled={submitting}
                        className="w-14 shrink-0 px-0"
                      >
                        <CaretLeft size={18} weight="bold" />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      className="min-w-0 flex-1"
                      disabled={submitting || (isRoleStep && !kind)}
                    >
                      {submitting && <Spinner data-icon="inline-start" />}
                      {isLastStep && flow ? flow.submitLabel : 'Continuar'}
                      {!isLastStep && <ArrowRight size={16} weight="bold" />}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <footer className="text-olive mt-auto pt-8 text-center text-body-sm">
          ¿Ya tenés una cuenta?{' '}
          <Link
            href="/login"
            className="text-pine hover:text-olive font-semibold underline underline-offset-4 transition-colors"
          >
            Iniciá sesión
          </Link>
        </footer>
      </section>

      <PreviewPanel data={preview} stepKey={step.id} caption={step.aside} />
    </main>
  );
}
