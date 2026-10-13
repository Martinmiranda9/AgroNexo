import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

// Geist se sirve local porque `next/font/google` no trae su itálica: sin ella el navegador inclinaba la normal.
// Son los archivos variables (100–900) de Google Fonts, subconjunto latin, el mismo que se usaba antes.
const geistSans = localFont({
  variable: '--font-geist-sans',
  display: 'swap',
  src: [
    { path: './fonts/Geist-Variable-latin.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/Geist-Italic-Variable-latin.woff2', weight: '100 900', style: 'italic' },
  ],
});

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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-beige text-pine font-sans antialiased">{children}</body>
    </html>
  );
}
