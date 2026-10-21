import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import './globals.css';

// Inter (la tipografía de Cashmere), variable: un solo archivo sirve todos los pesos. Sin itálica: el producto no la
// usa y cada estilo suma archivos que se precargan en todas las páginas.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Única excepción: las cifras en `font-mono` (IDs, teléfonos, contadores) conservan Geist Mono.
// No se precarga: aparece en pocas cifras y casi nunca arriba de todo; mientras llega se ve la mono del sistema.
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
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
      <body className="bg-sage-50 text-foreground font-sans antialiased">{children}</body>
    </html>
  );
}
