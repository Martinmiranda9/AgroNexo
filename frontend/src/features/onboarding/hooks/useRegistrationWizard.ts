'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, registerWithSession, ApiError } from '@/core/services/identity.service';
import { REGISTRATION_FLOWS } from '../config/flows';
import { ROLE_STEP } from '../config/roles';
import type { FormValues, PreviewData, RegistrationAccount, RegistrationKind } from '../config/types';
import { buildRegisterRequest } from '../lib/build-request';
import { validateStep, type FieldErrors } from '../lib/validation';

/** Vista previa mientras todavía no se eligió rol. */
const EMPTY_PREVIEW: PreviewData = {
  badge: 'Tu rol',
  rows: [{ icon: 'phone' }, { icon: 'map' }, { icon: 'briefcase' }, { icon: 'clock' }],
};

/**
 * Estado y transiciones del registro multipaso. El paso 0 es la elección de rol;
 * los siguientes salen del flujo del rol elegido (`flow.steps[stepIndex - 1]`).
 */
export function useRegistrationWizard(initialKind?: RegistrationKind, account?: RegistrationAccount) {
  const router = useRouter();

  // Nombre y apellido que ya conoce Google: quedan cargados (y editables) sin importar el rol elegido.
  const prefill = useMemo<FormValues>(
    () => ({
      ...(account?.firstName ? { firstName: account.firstName } : {}),
      ...(account?.lastName ? { lastName: account.lastName } : {}),
    }),
    [account?.firstName, account?.lastName],
  );

  const [kind, setKind] = useState<RegistrationKind | undefined>(initialKind);
  const [values, setValues] = useState<FormValues>(
    initialKind ? { ...REGISTRATION_FLOWS[initialKind].initialValues, ...prefill } : { ...prefill },
  );
  // Con el rol ya definido por URL se salta directo al primer paso del formulario.
  const [stepIndex, setStepIndex] = useState(initialKind ? 1 : 0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const flow = kind ? REGISTRATION_FLOWS[kind] : undefined;
  const isRoleStep = stepIndex === 0;
  const formStep = flow && !isRoleStep ? flow.steps[stepIndex - 1] : undefined;
  const step = formStep ?? { ...ROLE_STEP, fields: [] };

  // Sin rol elegido se cuenta el flujo más largo para que la barra no cambie de largo al elegir.
  const totalSteps = 1 + (flow ?? REGISTRATION_FLOWS.producer).steps.length;
  const isLastStep = stepIndex === totalSteps - 1;

  const preview = useMemo(
    () => (flow ? flow.preview(values, Math.max(stepIndex - 1, 0)) : EMPTY_PREVIEW),
    [flow, values, stepIndex],
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
      const request = buildRegisterRequest(kind, values);
      // Con sesión de Auth0 el token lo agrega el servidor; sin ella (dev local) se usa el token de prueba.
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
    if (isRoleStep) {
      if (kind) setStepIndex(1);
      return;
    }
    if (!formStep) return;

    const stepErrors = validateStep(formStep, values);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    if (isLastStep) void submit();
    else setStepIndex((i) => i + 1);
  }, [isRoleStep, kind, formStep, values, isLastStep, submit]);

  return {
    kind,
    flow,
    step,
    stepIndex,
    totalSteps,
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
