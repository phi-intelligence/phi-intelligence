/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: {
          DEFAULT: '#c8ff46',
          light: '#e0ff8f',
          dark: '#a8d93a',
        },
        background: {
          start: '#dfe6d6',
          mid: '#e9f1dc',
          end: '#e9ecf0',
        },
        text: {
          primary: '#1e1f21',
          secondary: '#6b7075',
          muted: '#9ca0a4',
        },
      },
      borderRadius: {
        'card': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};





