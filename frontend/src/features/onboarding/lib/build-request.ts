import { State } from 'country-state-city';
import { USER_TYPE } from '@/core/models/identity.model';
import type { HectaresRange, ProducerType, RegisterUserRequest, SearchableRole } from '@/core/models/identity.model';
import { PROFESSIONAL_ROLE } from '../config/flows';
import type { FormValues, RegistrationKind } from '../config/types';
import { buildCoveragePolygon } from './geo';
import { normalizePhone } from './validation';
import { parseMulti } from './values';

const clean = (value?: string) => value?.trim() || undefined;

/** Convierte los valores del formulario en el body de POST /api/v1/identity/register. */
export function buildRegisterRequest(kind: RegistrationKind, v: FormValues): RegisterUserRequest {
  const base = {
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    documentNumber: clean(v.documentNumber),
    phoneNumber: normalizePhone(v.phoneNumber),
  };

  if (kind === 'producer') {
    return {
      ...base,
      userType: USER_TYPE.Producer,
      producerType: clean(v.producerType) as ProducerType | undefined,
      hectaresRange: clean(v.hectaresRange) as HectaresRange | undefined,
      lookingFor: parseMulti(v.lookingFor) as SearchableRole[],
      country: clean(v.country),
      province: clean(v.province),
      city: clean(v.city),
    };
  }

  const state = v.provinceCode ? State.getStateByCodeAndCountry(v.provinceCode, v.countryCode) : undefined;
  const hasCoverage = state?.latitude && state.longitude;

  return {
    ...base,
    userType: USER_TYPE.Professional,
    role: PROFESSIONAL_ROLE[kind],
    specialty: clean(v.specialty),
    licenseNumber: clean(v.licenseNumber),
    yearsExperience: Number(v.yearsExperience),
    maxCapacity: Number(v.maxCapacity),
    coverageAreaCoordinates: hasCoverage
      ? buildCoveragePolygon(Number(state.latitude), Number(state.longitude), Number(v.coverageRadius))
      : undefined,
  };
}
