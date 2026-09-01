/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        risk: {
          critical: '#F43F5E',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#22C55E',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        bg: {
          app: '#080A0F',
          sidebar: '#0D1117',
          surface: '#11161E',
          elevated: '#161C25',
          hover: '#1B222D',
          input: '#0D1117',
        },
        border: {
          default: '#252C37',
          subtle: '#1B212B',
          active: '#38BDF8',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          disabled: '#475569',
        },
        accent: {
          primary: '#38BDF8',
          secondary: '#818CF8',
        },
        status: {
          critical: '#F43F5E',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#22C55E',
          info: '#38BDF8',
          live: '#22D3EE',
        },
      },
      borderRadius: {
        card: '8px',
        panel: '8px',
        input: '6px',
        button: '6px',
        modal: '10px',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0,0,0,0.20)',
        modal: '0 12px 40px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
