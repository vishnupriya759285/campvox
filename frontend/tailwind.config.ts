import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#EEF9F4',
          100: '#DDF3EA',
          200: '#BDE6D6',
          300: '#88D0B7',
          400: '#48AF8C',
          500: '#218F6B',
          600: '#168461',
          700: '#0F7455',
          800: '#0E5D47',
          900: '#123D42',
          950: '#123650',
        },
        sage: {
          50: '#EEF9F4',
          100: '#DDF3EA',
          200: '#BDE6D6',
          300: '#88D0B7',
          500: '#218F6B',
          600: '#168461',
          700: '#0F7455',
          800: '#0E5D47',
          900: '#123D42',
          950: '#123650',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#F8FAF9',
          200: '#F1F5F2',
          300: '#E5EDE7',
        },
        coral: {
          50: '#FFF5F4',
          100: '#FFEBEA',
          200: '#FFD7D4',
          300: '#FFB3AD',
          400: '#FF887E',
          500: '#F07167',
          600: '#E0554A',
          700: '#BC3A30',
          800: '#9B322A',
          900: '#802F2A',
        },
        navy: {
          50: '#F0F6FA',
          100: '#DFEDF5',
          200: '#C4DEED',
          300: '#9DC8DF',
          400: '#6FAECD',
          500: '#4592BA',
          600: '#2E759D',
          700: '#235D7E',
          800: '#1B4A65',
          900: '#123650',
          950: '#0A2234',
        },
        brand: {
          text: '#123650',
          navy: '#123650',
          muted: '#637C92',
          border: '#D8E8E9',
          cream: '#FFFFFF',
          ivory: '#F7FCFC',
          primary: '#168461',
          dark: '#0F7455',
          deep: '#0E5D47',
          forest: '#123650',
          emerald: '#218F6B',
          mint: '#DDF3EA',
          coral: '#F07167',
        },
        status: {
          reported: '#D97706',
          assigned: '#475569',
          progress: '#7C3AED',
          resolved: '#15803D',
          verified: '#16A34A',
          reopened: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        base: ['0.9375rem', { lineHeight: '1.375rem' }], // 15px
        lg: ['1.0625rem', { lineHeight: '1.5rem' }],    // 17px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['2.75rem', { lineHeight: '1.1' }],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(18, 54, 80, 0.05), 0 1px 2px rgba(18, 54, 80, 0.03)',
        card: '0 8px 28px -12px rgba(18, 54, 80, 0.14), 0 2px 7px -3px rgba(18, 54, 80, 0.08)',
        hover: '0 18px 38px -16px rgba(18, 54, 80, 0.22), 0 6px 16px -6px rgba(18, 54, 80, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
