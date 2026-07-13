/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          900: '#080b0f',
          800: '#0b0f14',
          700: '#11161d',
          600: '#19202b',
          500: '#232d3b',
          400: '#344356',
          300: '#52657e',
          200: '#8498b3',
          100: '#c5d3e6',
        },
        flora: {
          green: '#10b981',
          yellow: '#f59e0b',
          orange: '#f97316',
          red: '#ef4444',
          cyan: '#06b6d4',
          blue: '#3b82f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
