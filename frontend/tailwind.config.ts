import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-page': '#fef7e5',
        'bg-hero': '#FFF3D5',
        'bg-card': '#FFFBF0',
        primary: {
          DEFAULT: '#4D694E',
          hover: '#3F4C26',
        },
        accent: {
          mid: '#728141',
          light: '#99A474',
        },
        dark: '#24301E',
        'neutral-warm': '#978A56',
        danger: '#8C4A34',
        // ── Nuevos colores principales: Pine & Beige ──
        pine: {
          DEFAULT: '#00311e',
          hover: '#002617',
          light: '#0a4a2e',
        },
        beige: {
          DEFAULT: '#fef7e5',
          dark: '#f5ead4',
          deeper: '#ede0c4',
        },
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
