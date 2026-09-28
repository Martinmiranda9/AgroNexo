'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, registerWithCredentials, registerWithSession, ApiError } from '@/core/services/identity.service';
import { ACCOUNT_EMAIL_FIELD, ACCOUNT_STEP } from '../config/account';
import { REGISTRATION_FLOWS } from '../config/flows';
import { ROLE_STEP } from '../config/roles';
import type {
  AccountCredentials,
  FormValues,
  PreviewData,
  RegistrationAccount,
  RegistrationKind,
  StepDef,
} from '../config/types';
import { buildRegisterRequest } from '../lib/build-request';
import { validateStep, type FieldErrors } from '../lib/validation';

/** Vista previa mientras todavía no se eligió rol. */
const EMPTY_PREVIEW: PreviewData = {
  badge: 'Tu rol',
  rows: [{ icon: 'phone' }, { icon: 'map' }, { icon: 'briefcase' }, { icon: 'clock' }],
};

const EMPTY_CREDENTIALS: AccountCredentials = { email: '', password: '', passwordConfirm: '' };

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
 * correo que quedó a medias) se omite y nombre, apellido y correo salen de la cuenta.
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
  // Las credenciales van aparte de `values`: cambiar de rol reinicia `values` y no debe borrarlas.
  const [credentials, setCredentials] = useState<AccountCredentials>(EMPTY_CREDENTIALS);
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

  const clearErrors = useCallback((keys: string[]) => {
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const updateValues = useCallback(
    (patch: FormValues) => {
      setValues((prev) => ({ ...prev, ...patch }));
      clearErrors(Object.keys(patch));
    },
    [clearErrors],
  );

  const updateCredentials = useCallback(
    (patch: Partial<AccountCredentials>) => {
      setCredentials((prev) => ({ ...prev, ...patch }));
      // Cambiar la contraseña invalida el error de "no coinciden" que pudiera tener la confirmación.
      clearErrors(patch.password !== undefined ? [...Object.keys(patch), 'passwordConfirm'] : Object.keys(patch));
    },
    [clearErrors],
  );

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
      // Con sesión el token lo agrega el servidor; sin sesión y con Auth0 se crea la cuenta acá mismo;
      // sin Auth0 (dev local) se usa el token de prueba.
      const response = account
        ? await registerWithSession(request)
        : hasAccountStep
          ? await registerWithCredentials(request, {
              email: credentials.email.trim().toLowerCase(),
              password: credentials.password,
            })
          : await registerUser(request);
      const query = new URLSearchParams({ name: response.firstName, publicId: String(response.publicId) });
      router.push(`/welcome?${query}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.detail ?? err.message : 'No pudimos conectarnos con el servidor. Intentá de nuevo.';

      // Problemas de la cuenta (correo en uso, contraseña rechazada): se vuelve al paso donde se corrigen.
      const accountField =
        err instanceof ApiError
          ? ({ email_exists: 'email', invalid_email: 'email', weak_password: 'password' } as const)[err.code as string]
          : undefined;
      if (accountField) {
        setErrors({ [accountField]: message });
        setStepIndex(0);
      } else {
        setSubmitError(message);
      }
      setSubmitting(false);
    }
  }, [kind, values, account, hasAccountStep, credentials, router]);

  const next = useCallback(() => {
    if (isAccountStep) {
      const stepErrors = validateStep(ACCOUNT_STEP, credentials);
      setErrors(stepErrors);
      if (Object.keys(stepErrors).length === 0) setStepIndex(kind ? roleIndex + 1 : roleIndex);
      return;
    }
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
  }, [isAccountStep, isRoleStep, kind, roleIndex, credentials, formStep, step, values, isLastStep, submit]);

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
  };
}
