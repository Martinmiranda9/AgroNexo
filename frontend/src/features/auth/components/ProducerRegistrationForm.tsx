'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationSelect, type LocationValue } from './LocationSelect';
import { registerProducer, ApiError } from '@/core/services/identity.service';
import { PRODUCER_USER_TYPE, type ProducerType } from '@/core/models/producer.model';

// ─── Esquema Zod ──────────────────────────────────────────────────────────────

const producerSchema = z
  .object({
    email: z.string().min(1, 'El email es obligatorio').email('Ingresá un email válido'),
    firstName: z.string().min(2, 'Mínimo 2 caracteres').max(100),
    lastName: z.string().min(2, 'Mínimo 2 caracteres').max(100),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Incluí una mayúscula')
      .regex(/[0-9]/, 'Incluí un número'),
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
    documentNumber: z.string().max(50).optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    producerType: z.enum(['Agricola', 'Ganadero', 'Mixto']).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ProducerFormValues = z.infer<typeof producerSchema>;

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-dark">
      {children}
      {optional && <span className="ml-1 font-normal text-neutral-warm/80">(Opcional)</span>}
    </label>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProducerRegistrationForm({
  initialEmail = '',
  onBack,
}: {
  initialEmail?: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationValue>({
    country: 'Argentina',
    countryCode: 'AR',
    province: '',
    provinceCode: '',
    city: '',
  });

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ProducerFormValues>({
    resolver: zodResolver(producerSchema),
    defaultValues: { email: initialEmail },
    mode: 'onTouched', // para que los errores se muestren al interactuar
  });

  const onSubmit = async (data: ProducerFormValues) => {
    setServerError(null);
    try {
      const response = await registerProducer({
        userType: PRODUCER_USER_TYPE,
        firstName: data.firstName,
        lastName: data.lastName,
        documentNumber: data.documentNumber || undefined,
        producerType: (data.producerType as ProducerType) || undefined,
        country: location.country || undefined,
        province: location.province || undefined,
        city: location.city || undefined,
      });
      const params = new URLSearchParams({
        name: response.firstName,
        publicId: String(response.publicId),
      });
      router.push(`/welcome?${params.toString()}`);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.',
      );
    }
  };

  const handleNext = async (fieldsToValidate: (keyof ProducerFormValues)[]) => {
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Botón Volver */}
      <button
        type="button"
        onClick={handlePrevious}
        className="mb-8 flex w-fit items-center gap-1.5 text-sm font-medium text-accent-mid transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === 1 ? 'Volver a roles' : 'Atrás'}
      </button>

      {/* Stepper Visual (Opcional, minimalista) */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              step >= i ? 'bg-primary' : 'bg-neutral-warm/20'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          {/* PASO 1: Datos Personales Básicos */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col justify-center gap-5"
            >
              <div>
                <h2 className="text-3xl font-bold text-dark">Empecemos</h2>
                <p className="mt-2 text-sm text-neutral-warm">Contanos cómo te llamas y tu correo de contacto.</p>
              </div>

              <div>
                <Label htmlFor="reg-email">Correo electrónico</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="h-12"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reg-fn">Nombre</Label>
                  <Input
                    id="reg-fn"
                    placeholder="Juan"
                    autoComplete="given-name"
                    className="h-12"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                </div>
                <div>
                  <Label htmlFor="reg-ln">Apellido</Label>
                  <Input
                    id="reg-ln"
                    placeholder="Pérez"
                    autoComplete="family-name"
                    className="h-12"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  type="button" 
                  size="lg" 
                  className="px-8"
                  onClick={() => handleNext(['email', 'firstName', 'lastName'])}
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* PASO 2: Documentación y Teléfono */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col justify-center gap-5"
            >
              <div>
                <h2 className="text-3xl font-bold text-dark">Un poco más de info</h2>
                <p className="mt-2 text-sm text-neutral-warm">Esta información nos ayuda a mantener la plataforma segura.</p>
              </div>

              <div>
                <Label htmlFor="reg-doc" optional>CUIT / CUIL / DNI</Label>
                <Input
                  id="reg-doc"
                  placeholder="20-12345678-9"
                  className="h-12"
                  error={errors.documentNumber?.message}
                  {...register('documentNumber')}
                />
              </div>

              <div>
                <Label htmlFor="reg-phone" optional>Celular</Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  className="h-12"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  type="button" 
                  size="lg" 
                  className="px-8"
                  onClick={() => handleNext(['documentNumber', 'phone'])}
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Producción y Ubicación */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col justify-center gap-5"
            >
              <div>
                <h2 className="text-3xl font-bold text-dark">Tu producción</h2>
                <p className="mt-2 text-sm text-neutral-warm">¿A qué te dedicás y dónde está tu campo?</p>
              </div>

              <div>
                <Label htmlFor="reg-type" optional>Tipo de producción</Label>
                <Controller
                  name="producerType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger id="reg-type" className="h-12">
                        <SelectValue placeholder="Seleccioná tu actividad principal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Agricola">Agrícola</SelectItem>
                        <SelectItem value="Ganadero">Ganadero</SelectItem>
                        <SelectItem value="Mixto">Mixto (Agricultura + Ganadería)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="rounded-2xl border border-neutral-warm/20 bg-bg-page/50 p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-warm">
                  Ubicación Principal
                </p>
                <LocationSelect defaultCountryCode="AR" onChange={setLocation} />
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  type="button" 
                  size="lg" 
                  className="px-8"
                  onClick={() => handleNext(['producerType'])}
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* PASO 4: Contraseñas y Crear Cuenta */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col justify-center gap-5"
            >
              <div>
                <h2 className="text-3xl font-bold text-dark">Protegé tu cuenta</h2>
                <p className="mt-2 text-sm text-neutral-warm">Último paso, elegí una contraseña segura.</p>
              </div>

              <div>
                <Label htmlFor="reg-pw">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="reg-pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                    autoComplete="new-password"
                    className="h-12 pr-12"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-4 top-[14px] text-neutral-warm/60 hover:text-dark"
                    aria-label={showPw ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="reg-confirm">Confirmá contraseña</Label>
                <div className="relative">
                  <Input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repetí la clave"
                    autoComplete="new-password"
                    className="h-12 pr-12"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-[14px] text-neutral-warm/60 hover:text-dark"
                    aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
                  role="alert"
                >
                  {serverError}
                </motion.div>
              )}

              <div className="mt-8 flex flex-col gap-4">
                <Button type="submit" size="lg" className="w-full h-12 text-base" loading={isSubmitting}>
                  {!isSubmitting && 'Crear cuenta'}
                </Button>
                <p className="text-center text-xs text-neutral-warm">
                  Al registrarte aceptás nuestros{' '}
                  <a href="/terms" className="font-medium text-primary hover:underline">
                    Términos de servicio
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
