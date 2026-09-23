'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Tractor, Calculator, LineChart, CheckCircle2, ArrowLeft } from 'lucide-react';

type Role = 'productor' | 'ingeniero' | 'contador' | 'inversionista';

const roles = [
  {
    id: 'productor',
    title: 'Productor',
    description: 'Gestiona tus campos y colabora con tu equipo.',
    icon: Tractor,
  },
  {
    id: 'ingeniero',
    title: 'Ingeniero Agrónomo',
    description: 'Asesora sobre cultivos y rindes.',
    icon: Sprout,
  },
  {
    id: 'contador',
    title: 'Contador',
    description: 'Gestiona la administración y finanzas.',
    icon: Calculator,
  },
  {
    id: 'inversionista',
    title: 'Inversionista',
    description: 'Sigue el progreso y rentabilidad.',
    icon: LineChart,
  },
];

export function OnboardingFlow({ initialEmail = 'usuario@ejemplo.com' }: { initialEmail?: string }) {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setTimeout(() => {
      setStep('form');
    }, 400); // Wait a bit for the user to see the selection
  };

  return (
    <div className="flex min-h-screen bg-bg-page w-full">
      {/* Left side fixed image/branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Placeholder background graphic */}
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
          </svg>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">AgroNexo</h1>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-semibold mb-4 leading-tight text-bg-hero">
            El campo,<br/>conectado como<br/>nunca antes.
          </h2>
          <p className="text-accent-light text-lg max-w-md">
            Gestiona tu producción, colabora con tu equipo y lleva el control al siguiente nivel.
          </p>
        </div>
      </div>

      {/* Right side interactive content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg">
          
          <AnimatePresence mode="wait">
            {step === 'role' && (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-dark mb-3">¿Cómo vas a usar AgroNexo?</h2>
                  <p className="text-neutral-warm">Personalizaremos tu experiencia según tu rol.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roles.map((role) => {
                    const isSelected = selectedRole === role.id;
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id as Role)}
                        className={`relative group flex flex-col items-center text-center p-6 rounded-[var(--radius-card)] border-2 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-page ${
                          isSelected
                            ? 'border-primary bg-white shadow-md'
                            : 'border-transparent bg-bg-card hover:bg-white hover:border-accent-light hover:shadow-sm'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-primary">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                        
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
                          isSelected ? 'bg-bg-hero text-primary' : 'bg-bg-page text-accent-mid group-hover:text-primary group-hover:bg-bg-hero'
                        }`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        
                        <h3 className="font-semibold text-dark mb-1">{role.title}</h3>
                        <p className="text-sm text-neutral-warm">{role.description}</p>
                      </button>
                    );
                  })}
                </div>
                
                {/* Simulated Google login hint */}
                <div className="mt-10 text-center">
                   <p className="text-sm text-neutral-warm">
                    Ingresando con <span className="font-medium text-dark">{initialEmail}</span>
                   </p>
                </div>
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div
                key="details-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => {
                    setStep('role');
                    setSelectedRole(null);
                  }}
                  className="flex items-center text-sm font-medium text-accent-mid hover:text-primary mb-8 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver a roles
                </button>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-dark mb-2">Completa tu perfil</h2>
                  <p className="text-neutral-warm">
                    Registrándote como <strong className="text-primary font-semibold">{roles.find(r => r.id === selectedRole)?.title}</strong>
                  </p>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      disabled
                      value={initialEmail}
                      className="w-full px-4 py-3 rounded-[var(--radius-input)] bg-bg-page border border-neutral-warm/30 text-neutral-warm cursor-not-allowed focus:outline-none"
                    />
                    <p className="text-xs text-accent-mid mt-1">Vinculado a tu cuenta de Google</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Nombre</label>
                      <input 
                        type="text" 
                        placeholder="Juan"
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] bg-white border border-neutral-warm/30 text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Apellido</label>
                      <input 
                        type="text" 
                        placeholder="Pérez"
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] bg-white border border-neutral-warm/30 text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Teléfono (Opcional)</label>
                    <input 
                      type="tel" 
                      placeholder="+54 11 1234-5678"
                      className="w-full px-4 py-3 rounded-[var(--radius-input)] bg-white border border-neutral-warm/30 text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="pt-4">
                    <button className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-[var(--radius-input)] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-page">
                      Completar Registro
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
