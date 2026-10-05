import { USER_TYPE } from '@/core/models/identity.model';
import type { HectaresRange, ProducerType, RegisterUserRequest, SearchableRole } from '@/core/models/identity.model';
import { PROFESSIONAL_ROLE } from '../config/flows';
import type { FormValues, RegistrationKind } from '../config/types';
import { buildCoveragePolygon } from './geo';
import { normalizePhone } from './validation';
import { parseMulti } from './values';

const clean = (value?: string) => value?.trim() || undefined;

/** Convierte los valores del formulario en el body de POST /api/v1/identity/register. */
export async function buildRegisterRequest(kind: RegistrationKind, v: FormValues): Promise<RegisterUserRequest> {
  const base = {
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    documentNumber: clean(v.documentNumber),
    phoneNumber: normalizePhone(v.phoneNumber),
    email: clean(v.email),
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

  // El radio se mide desde la ciudad elegida; sin ciudad (o si el dato no trae coordenadas), desde el centro de la provincia.
  const geoData = v.provinceCode ? await import('country-state-city') : undefined;
  const state = geoData?.State.getStateByCodeAndCountry(v.provinceCode, v.countryCode);
  const city = v.city ? geoData?.City.getCitiesOfState(v.countryCode, v.provinceCode).find((c) => c.name === v.city) : undefined;
  const center = city?.latitude && city.longitude ? city : state?.latitude && state.longitude ? state : undefined;

  return {
    ...base,
    userType: USER_TYPE.Professional,
    role: PROFESSIONAL_ROLE[kind],
    specialty: clean(v.specialty),
    licenseNumber: clean(v.licenseNumber),
    yearsExperience: Number(v.yearsExperience),
    maxCapacity: Number(v.maxCapacity),
    coverageAreaCoordinates: center
      ? buildCoveragePolygon(Number(center.latitude), Number(center.longitude), Number(v.coverageRadius))
      : undefined,
  };
}
