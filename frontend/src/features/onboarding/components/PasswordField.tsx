'use client';

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { Input } from '@/ui/components';
import type { PasswordField as PasswordFieldDef } from '../config/types';

interface PasswordFieldProps {
  field: PasswordFieldDef;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/** Campo de contraseña con mostrar/ocultar. Cada instancia recuerda su propia visibilidad. */
export default function PasswordField({ field, value, error, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const Toggle = visible ? EyeSlash : Eye;

  return (
    <Input
      label={field.label}
      error={error}
      hint={field.hint}
      className="h-12"
      type={visible ? 'text' : 'password'}
      placeholder={field.placeholder}
      autoComplete={field.autoComplete}
      maxLength={128}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rightIcon={<Toggle size={16} aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'} />}
      onRightIconClick={() => setVisible((v) => !v)}
    />
  );
}
