/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'creepster': ['Creepster', 'cursive'],
        'tech': ['Rajdhani', 'sans-serif'],
        'darkhorse': ['"Dark Horse"', 'cursive'],
        'darkhorse4': ['"Dark Horse 4"', 'cursive']
      },
      colors: {
        // Spooky theme colors
        'graveyard': {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          850: '#161a1d',
          900: '#1a1d20',
          950: '#0d0f10',
        },
        'spectral': {
          purple: '#8b5cf6',
          green: '#10b981',
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        }
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        glitch: 'glitch 0.3s ease-in-out'
      }
    },
  },
  plugins: [],
}
