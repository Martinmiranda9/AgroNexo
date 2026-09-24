'use client';

import { motion, useReducedMotion } from 'motion/react';
import { OptionCard } from '@/ui/components';
import { ROLE_OPTIONS } from '../config/roles';
import type { RegistrationKind } from '../config/types';

interface RoleStepProps {
  value?: RegistrationKind;
  onChange: (kind: RegistrationKind) => void;
  /** Id del título del paso, para nombrar el grupo de radios. */
  labelledBy: string;
}

/** Selección de rol: el productor va a todo el ancho y los cuatro profesionales en grilla de 2. */
export default function RoleStep({ value, onChange, labelledBy }: RoleStepProps) {
  const reduce = useReducedMotion();

  return (
    <div className="@container">
      <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-1 gap-3 @md:grid-cols-2">
        {ROLE_OPTIONS.map(({ kind, title, description, icon: RoleIcon }, i) => (
          <motion.div
            key={kind}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={kind === 'producer' ? '@md:col-span-2' : undefined}
          >
            <OptionCard
              name="role"
              value={kind}
              title={title}
              description={description}
              icon={<RoleIcon size={20} weight="regular" />}
              checked={value === kind}
              onSelect={(v) => onChange(v as RegistrationKind)}
              layout={kind === 'producer' ? 'inline' : 'auto'}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
