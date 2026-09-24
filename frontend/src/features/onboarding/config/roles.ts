import { Calculator, ChartLineUp, Plant, Scales, Tractor } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import type { RegistrationKind, StepDef } from './types';

export interface RoleOption {
  kind: RegistrationKind;
  title: string;
  description: string;
  icon: Icon;
}

/** Primer paso del registro: define qué flujo sigue el resto del formulario. */
export const ROLE_STEP: Omit<StepDef, 'fields'> = {
  id: 'role',
  title: '¿Cuál es tu rol?',
  subtitle: 'Elegí cómo vas a usar AgroNexo. Con eso armamos tu perfil y tus conexiones.',
  aside: 'Tu rol define qué te pedimos a continuación y con quiénes te conectamos.',
};

export const ROLE_OPTIONS: RoleOption[] = [
  {
    kind: 'producer',
    title: 'Productor',
    description: 'Tengo un campo y busco profesionales que me acompañen.',
    icon: Tractor,
  },
  {
    kind: 'agronomist',
    title: 'Ingeniero agrónomo',
    description: 'Asesoro en cultivos, suelos y manejo del establecimiento.',
    icon: Plant,
  },
  {
    kind: 'accountant',
    title: 'Contador',
    description: 'Llevo impuestos, balances y la contabilidad del campo.',
    icon: Calculator,
  },
  {
    kind: 'lawyer',
    title: 'Abogado',
    description: 'Trabajo contratos, arrendamientos y derecho agrario.',
    icon: Scales,
  },
  {
    kind: 'investor',
    title: 'Inversionista',
    description: 'Financio campañas y proyectos productivos.',
    icon: ChartLineUp,
  },
];
