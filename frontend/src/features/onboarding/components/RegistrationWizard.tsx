'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CaretLeft, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { Button } from '@/ui/components';
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
  /** Sin sesión y con Auth0 activo: el wizard empieza con el paso "Tu cuenta" (Google o correo y contraseña). */
  requiresAccount?: boolean;
}) {
  const reduce = useReducedMotion();
  const {
    kind,
    flow,
    step,
    stepIndex,
    totalSteps,
    isAccountStep,
    isRoleStep,
    isLastStep,
    values,
    credentials,
    errors,
    preview,
    submitting,
    submitError,
    selectKind,
    updateValues,
    updateCredentials,
    next,
    back,
  } = useRegistrationWizard(initialKind, account, requiresAccount);

  return (
    <div className="bg-bg-card text-pine flex min-h-[100dvh] w-full flex-col md:flex-row">
      <section className="flex min-h-[100dvh] w-full flex-col px-6 pt-8 pb-8 sm:px-12 md:w-[46%] md:px-12 lg:px-16">
        {/* Bloque centrado en vertical. La altura mínima es la del paso más alto (rol), así el header
            y los botones no se mueven al pasar entre pasos de distinto largo. */}
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center">
          <div className="flex flex-col md:min-h-[670px]">
            <OnboardingHeader current={stepIndex} total={totalSteps} />

            {account?.email && (
              <p className="border-pine/10 bg-beige text-primary mt-6 flex flex-wrap items-center gap-x-1.5 rounded-xl border px-3.5 py-2.5 text-caption">
                <CheckCircle size={16} weight="fill" className="text-primary shrink-0" />
                <span>
                  Cuenta {account.provider === 'google-oauth2' ? 'de Google' : ''}{' '}
                  <strong className="text-pine font-semibold">{account.email}</strong>
                </span>
                <a
                  href={`/api/auth/logout?returnTo=${encodeURIComponent('/onboarding')}`}
                  className="text-pine ml-auto font-semibold underline underline-offset-4"
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
                    id={TITLE_ID}
                    className="text-heading-md tracking-heading"
                  >
                    {step.title}
                  </h1>
                  <p className="text-primary mt-2 text-body-sm">{step.subtitle}</p>
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
                      <AccountStep step={step} credentials={credentials} errors={errors} onChange={updateCredentials} />
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
                    className="border-danger/30 bg-danger/5 text-danger flex items-start gap-2 rounded-xl border px-3.5 py-3 text-body-sm"
                  >
                    <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
                    {submitError}
                  </p>
                )}

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
                    fullWidth
                    loading={submitting}
                    disabled={isRoleStep && !kind}
                  >
                    {isLastStep && flow ? flow.submitLabel : 'Continuar'}
                    {!isLastStep && <ArrowRight size={16} weight="bold" />}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <footer className="text-primary mt-auto pt-8 text-center text-caption">
          ¿Ya tenés una cuenta?{' '}
          <Link
            href="/login"
            className="text-pine hover:text-primary font-semibold underline underline-offset-4 transition-colors"
          >
            Iniciá sesión
          </Link>
        </footer>
      </section>

      <PreviewPanel data={preview} stepKey={step.id} caption={step.aside} />
    </div>
  );
}
