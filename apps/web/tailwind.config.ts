import type { Config } from 'tailwindcss';

/**
 * ATLAS "Intelligence Operations / Digital Observatory" design tokens.
 * Deep atmospheric backgrounds, technical typography, restrained accents,
 * thin borders — no generic SaaS purple-gradients.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#04070c',
          raised: '#0a101a',
          panel: '#0d1522',
          line: 'rgba(120, 160, 210, 0.14)',
        },
        phosphor: {
          DEFAULT: '#4fd8c8',
          dim: '#2b9d92',
          faint: 'rgba(79, 216, 200, 0.35)',
        },
        amber: {
          signal: '#e8b64c',
        },
        slate: {
          tech: '#8aa3c2',
        },
        danger: '#e05b5b',
      },
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(120,160,210,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120,160,210,0.06) 1px, transparent 1px)',
        'radial-void':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(30,60,120,0.25), transparent)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(120,160,210,0.12), 0 12px 40px -18px rgba(0,0,0,0.9)',
        glow: '0 0 24px -6px rgba(79,216,200,0.5)',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        scan: 'scan 6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;