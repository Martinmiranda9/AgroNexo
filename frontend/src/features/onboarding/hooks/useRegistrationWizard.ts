'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, registerWithSession, ApiError } from '@/core/services/identity.service';
import { ACCOUNT_EMAIL_FIELD, ACCOUNT_STEP } from '../config/account';
import { REGISTRATION_FLOWS } from '../config/flows';
import { ROLE_STEP } from '../config/roles';
import type { FormValues, PreviewData, RegistrationAccount, RegistrationKind, StepDef } from '../config/types';
import { buildRegisterRequest } from '../lib/build-request';
import { validateStep, type FieldErrors } from '../lib/validation';

/** Vista previa mientras todavía no se eligió rol. */
const EMPTY_PREVIEW: PreviewData = {
  badge: 'Tu rol',
  rows: [{ icon: 'phone' }, { icon: 'map' }, { icon: 'briefcase' }, { icon: 'clock' }],
};

/** El correo de la cuenta se muestra (solo lectura) justo después del apellido. */
function withAccountEmail(step: StepDef): StepDef {
  if (step.id !== 'personal') return step;
  const at = step.fields.findIndex((f) => 'name' in f && f.name === 'lastName') + 1;
  return { ...step, fields: [...step.fields.slice(0, at), ACCOUNT_EMAIL_FIELD, ...step.fields.slice(at)] };
}

/**
 * Estado y transiciones del registro multipaso. Orden de pasos:
 *   [cuenta] → rol → pasos de datos del rol (`flow.steps`)
 * El paso de cuenta solo existe si todavía no hay sesión (`requiresAccount`); con una sesión (Google o
 * correo, ambos autenticados vía el popup de Auth0 en `AccountStep.tsx`) se omite y nombre, apellido y
 * correo salen de la cuenta. Por eso, al llegar a `submit()`, siempre hay `account` o estamos en el
 * camino de desarrollo sin Auth0 (`registerUser` con token de prueba) — nunca se arma un registro con
 * credenciales sueltas acá.
 */
export function useRegistrationWizard(
  initialKind?: RegistrationKind,
  account?: RegistrationAccount,
  requiresAccount = false,
) {
  const router = useRouter();
  const hasAccountStep = requiresAccount && !account;
  const roleIndex = hasAccountStep ? 1 : 0;

  // Lo que ya conoce Google: queda cargado (los nombres, editables) sin importar el rol elegido.
  const prefill = useMemo<FormValues>(
    () => ({
      ...(account?.firstName ? { firstName: account.firstName } : {}),
      ...(account?.lastName ? { lastName: account.lastName } : {}),
      ...(account?.email ? { email: account.email } : {}),
    }),
    [account?.firstName, account?.lastName, account?.email],
  );

  const [kind, setKind] = useState<RegistrationKind | undefined>(initialKind);
  const [values, setValues] = useState<FormValues>(
    initialKind ? { ...REGISTRATION_FLOWS[initialKind].initialValues, ...prefill } : { ...prefill },
  );
  // Con el rol ya definido por URL se salta directo al primer paso del formulario.
  const [stepIndex, setStepIndex] = useState(hasAccountStep ? 0 : initialKind ? 1 : 0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const flow = kind ? REGISTRATION_FLOWS[kind] : undefined;
  const isAccountStep = hasAccountStep && stepIndex === 0;
  const isRoleStep = stepIndex === roleIndex;
  const formStep = flow && stepIndex > roleIndex ? flow.steps[stepIndex - roleIndex - 1] : undefined;
  const step = useMemo<StepDef>(() => {
    if (isAccountStep) return ACCOUNT_STEP;
    if (!formStep) return { ...ROLE_STEP, fields: [] };
    return account?.email ? withAccountEmail(formStep) : formStep;
  }, [isAccountStep, formStep, account?.email]);

  // Sin rol elegido se cuenta el flujo más largo para que la barra no cambie de largo al elegir.
  const totalSteps = roleIndex + 1 + (flow ?? REGISTRATION_FLOWS.producer).steps.length;
  const isLastStep = stepIndex === totalSteps - 1;

  const preview = useMemo(
    () => (flow ? flow.preview(values, Math.max(stepIndex - roleIndex - 1, 0)) : EMPTY_PREVIEW),
    [flow, values, stepIndex, roleIndex],
  );

  const selectKind = useCallback(
    (next: RegistrationKind) => {
      if (next === kind) return;
      setKind(next);
      // Cambiar de rol reinicia el formulario, pero conserva lo que vino de Google.
      setValues({ ...REGISTRATION_FLOWS[next].initialValues, ...prefill });
      setErrors({});
      setSubmitError(undefined);
    },
    [kind, prefill],
  );

  const updateValues = useCallback((patch: FormValues) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const back = useCallback(() => {
    setSubmitError(undefined);
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const submit = useCallback(async () => {
    if (!kind) return;
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const request = buildRegisterRequest(kind, { ...values, email: values.email ?? account?.email });
      // Con sesión (Google o correo, ambos autenticados por el popup) el token lo agrega el servidor;
      // sin Auth0 configurado (dev local) se usa el token de prueba.
      const response = account ? await registerWithSession(request) : await registerUser(request);
      const query = new URLSearchParams({ name: response.firstName, publicId: String(response.publicId) });
      router.push(`/welcome?${query}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.detail ?? err.message : 'No pudimos conectarnos con el servidor. Intentá de nuevo.',
      );
      setSubmitting(false);
    }
  }, [kind, values, account, router]);

  const next = useCallback(() => {
    // El paso de cuenta no se avanza por acá: `AccountStep` maneja su propio popup y, al terminar,
    // recarga la página ya con sesión (deja de existir `isAccountStep`).
    if (isAccountStep) return;
    if (isRoleStep) {
      if (kind) setStepIndex(roleIndex + 1);
      return;
    }
    if (!formStep) return;

    const stepErrors = validateStep(step, values);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    if (isLastStep) void submit();
    else setStepIndex((i) => i + 1);
  }, [isAccountStep, isRoleStep, kind, roleIndex, formStep, step, values, isLastStep, submit]);

  return {
    kind,
    flow,
    step,
    stepIndex,
    totalSteps,
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
  };
}
