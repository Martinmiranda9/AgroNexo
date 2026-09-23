'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Tractor, Leaf, Calculator, TrendUp, ArrowRight, Check } from '@phosphor-icons/react';
import { ProducerRegistrationForm } from './ProducerRegistrationForm';

export type UserRole = 'productor' | 'ingeniero' | 'contador' | 'inversionista';

interface RoleOption {
  id: UserRole;
  label: string;
  sublabel: string;
  Icon: React.ElementType;
}

const ROLES: RoleOption[] = [
  { id: 'productor',     label: 'Productor',     sublabel: 'Campos y campañas',      Icon: Tractor    },
  { id: 'ingeniero',     label: 'Ing. Agrónomo', sublabel: 'Asesoría técnica',        Icon: Leaf       },
  { id: 'contador',      label: 'Contador',      sublabel: 'Gestión fiscal',          Icon: Calculator },
  { id: 'inversionista', label: 'Inversionista', sublabel: 'Rentabilidad del campo',  Icon: TrendUp    },
];

function PremiumRoleCard({
  option,
  selected,
  onSelect,
}: {
  option: RoleOption;
  selected: boolean;
  onSelect: (id: UserRole) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      whileTap={reduce ? undefined : { scale: 0.97 }}
      onClick={() => onSelect(option.id)}
      role="radio"
      aria-checked={selected}
      className={[
        'group relative flex w-full flex-col items-start rounded-[16px] border bg-[#FFFBF0] p-5 text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D694E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7EFDA]',
        selected
          ? 'border-[#4D694E] bg-white shadow-[0_4px_16px_rgba(77,105,78,0.08)]'
          : 'border-[rgba(151,138,86,0.25)] hover:border-[#4D694E]/50 hover:bg-white hover:shadow-sm',
      ].join(' ')}
    >
      <div className="mb-4 flex w-full items-start justify-between">
        {/* Ícono */}
        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
            selected
              ? 'bg-[rgba(77,105,78,0.12)] text-[#4D694E]'
              : 'bg-[#F7EFDA] text-[#728141] group-hover:bg-[rgba(77,105,78,0.08)] group-hover:text-[#4D694E]',
          ].join(' ')}
        >
          <option.Icon weight={selected ? 'fill' : 'regular'} size={20} aria-hidden="true" />
        </div>

        {/* Radio Indicator Premium */}
        <div
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
            selected
              ? 'border-[#4D694E] bg-[#4D694E]'
              : 'border-[rgba(151,138,86,0.35)] bg-transparent group-hover:border-[#4D694E]/50',
          ].join(' ')}
        >
          {selected && (
            <motion.span
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check weight="bold" size={12} className="text-white" />
            </motion.span>
          )}
        </div>
      </div>

      <div>
        <p className="text-base font-semibold leading-tight text-[#24301E]">
          {option.label}
        </p>
        <p className="mt-0.5 text-xs text-[#978A56]">
          {option.sublabel}
        </p>
      </div>
    </motion.button>
  );
}

export function OnboardingRolePanel({
  initialEmail = 'usuario@ejemplo.com',
  onStepChange,
}: {
  initialEmail?: string;
  onStepChange?: (step: 'role' | 'form') => void;
}) {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    setStep('form');
    onStepChange?.('form');
  };

  const handleBack = () => {
    setStep('role');
    setSelectedRole(null);
    onStepChange?.('role');
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'role' && (
          <motion.div
            key="role"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Logo Mobile */}
            <div className="mb-8 flex items-center gap-1.5 md:hidden">
              <span className="text-sm font-semibold tracking-tight text-[#24301E]">
                Agro<span className="text-[#728141]">Connect</span>
              </span>
            </div>

            <div className="mb-8 md:mb-10">
              <h1 className="text-[2rem] font-bold tracking-tight text-[#24301E]">
                ¿Cuál es tu rol?
              </h1>
              <p className="mt-1.5 text-sm text-[#978A56]">
                Personalizamos tu experiencia en AgroConnect.
              </p>
            </div>

            {/* Grid 2x2 de Cards */}
            <div
              role="radiogroup"
              aria-label="Selección de rol"
              className="mb-8 grid grid-cols-2 gap-3 md:gap-4"
            >
              {ROLES.map((role) => (
                <PremiumRoleCard
                  key={role.id}
                  option={role}
                  selected={selectedRole === role.id}
                  onSelect={setSelectedRole}
                />
              ))}
            </div>

            {/* Botón Continuar (Premium Solid) */}
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              aria-disabled={!selectedRole}
              className={[
                'flex w-full items-center justify-between rounded-[12px] px-5 py-3.5',
                'text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#24301E]',
                selectedRole
                  ? 'cursor-pointer bg-[#4D694E] text-white hover:bg-[#3F4C26]'
                  : 'cursor-not-allowed bg-[rgba(77,105,78,0.1)] text-[rgba(36,48,30,0.3)]',
              ].join(' ')}
            >
              <span>Continuar</span>
              <div className={[
                'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                selectedRole ? 'bg-white/20' : 'bg-transparent'
              ].join(' ')}>
                <ArrowRight weight="bold" size={12} className={selectedRole ? 'text-white' : 'text-transparent'} />
              </div>
            </button>

            <div className="mt-5 text-center">
              <p className="text-[11px] text-[#978A56]">
                Ingresando como <span className="font-mono text-[#24301E]">{initialEmail}</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Formularios ── */}
        {step === 'form' && selectedRole === 'productor' && (
          <ProducerRegistrationForm
            key="producer-form"
            initialEmail={initialEmail}
            onBack={handleBack}
          />
        )}

        {step === 'form' && selectedRole && selectedRole !== 'productor' && (
          <motion.div
            key="other-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={handleBack}
              className="mb-8 flex items-center gap-2 text-sm font-medium text-[#978A56] transition-colors hover:text-[#24301E]"
            >
              <ArrowRight weight="bold" size={14} className="rotate-180" aria-hidden="true" />
              Volver a roles
            </button>
            <h2 className="text-2xl font-bold text-[#24301E]">
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </h2>
            <p className="mt-2 text-sm text-[#978A56]">
              Formulario en construcción.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
