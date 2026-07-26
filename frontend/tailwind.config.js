/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base:     'rgb(var(--base) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        subtle:   'rgb(var(--subtle) / <alpha-value>)',
        border:   'rgb(var(--border-c) / <alpha-value>)',
        fg:       'rgb(var(--fg) / <alpha-value>)',
        muted:    'rgb(var(--muted) / <alpha-value>)',
        accent:   'rgb(var(--accent) / <alpha-value>)',
        ok:       '#10b981',
        warn:     '#f59e0b',
        err:      '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '12px',
        xl: '16px'
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(var(--border-c) / 0.6), 0 1px 2px 0 rgb(0 0 0 / 0.3)',
        glow: '0 0 0 1px rgb(var(--accent) / 0.35), 0 0 24px rgb(var(--accent) / 0.25)'
      },
      keyframes: {
        'fade-in':  { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'none' } },
        'pulse-soft': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } }
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
