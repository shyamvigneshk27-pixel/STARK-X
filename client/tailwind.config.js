/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
          DEFAULT: '#8b5cf6',
        },
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          fuchsia: '#d946ef',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.045)',
          dark: 'rgba(0,0,0,0.3)',
          border: 'rgba(255,255,255,0.1)',
        },
      },
      backgroundImage: {
        'mesh-gradient':
          'radial-gradient(at 40% 20%, hsla(265,100%,65%,0.8) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(220,100%,65%,0.6) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(340,100%,65%,0.4) 0px, transparent 50%), radial-gradient(at 90% 80%, hsla(180,100%,50%,0.3) 0px, transparent 50%)',
        aurora:
          'linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 40%, #4facfe 60%, #43e97b 80%, #667eea 100%)',
        'shimmer-gradient':
          'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.02) 75%)',
        'hero-gradient':
          'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(59,130,246,0.12) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(244,63,94,0.08) 0%, transparent 50%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(.4,0,.2,1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        aurora: 'aurora 12s ease infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139,92,246,0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(139,92,246,0.7), 0 0 80px rgba(59,130,246,0.3)' },
        },
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '100% 50%' },
          '75%': { backgroundPosition: '50% 100%' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(59,130,246,0.1)',
        'glow-lg': '0 0 80px rgba(139,92,246,0.45), 0 0 120px rgba(59,130,246,0.15)',
        'glow-blue': '0 0 40px rgba(59,130,246,0.3)',
        'glow-cyan': '0 0 40px rgba(6,182,212,0.3)',
        'glow-rose': '0 0 40px rgba(244,63,94,0.3)',
        glass: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)',
        card: '0 4px 24px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
