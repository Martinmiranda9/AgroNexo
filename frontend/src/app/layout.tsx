import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import './globals.css';

// Inter (la tipografía de Cashmere) con su itálica real; variable, así sirve todos los pesos.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Única excepción: las cifras en `font-mono` (IDs, teléfonos, contadores) conservan Geist Mono.
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AgroNexo',
    template: '%s | AgroNexo',
  },
  description: 'Plataforma Agro Multi-tenant — conectá productores con profesionales del campo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="bg-sage-50 text-pine font-sans antialiased">{children}</body>
    </html>
  );
}
