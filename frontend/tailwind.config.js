/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F3F1E8',        // Warm ivory background
        ink: {
          DEFAULT: '#0B1511',     // Dark near-black typography
          soft: '#23322C',
          muted: '#4A5B53'
        },
        pine: {
          light: '#538F75',
          DEFAULT: '#3F765F',     // Deep muted green
          dark: '#274E3E',
          deep: '#1A352A'
        },
        sage: {
          DEFAULT: '#AAB9A6',     // Sage green
          light: '#DDE5D8',       // Surface card green-grey
          soft: '#EAF0E7',
          dark: '#8C9E87'
        },
        gold: {
          DEFAULT: '#C99452',     // Subtle gold accent
          light: '#E5BF88',
          soft: '#F4E3CB',
          dark: '#A37233'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(11, 21, 17, 0.05)',
        'soft': '0 6px 20px -4px rgba(11, 21, 17, 0.07)',
        'soft-lg': '0 12px 32px -4px rgba(11, 21, 17, 0.09)',
        'soft-xl': '0 20px 48px -8px rgba(11, 21, 17, 0.12)',
        'gold-glow': '0 0 25px -4px rgba(201, 148, 82, 0.35)',
        'pine-glow': '0 0 25px -4px rgba(63, 118, 95, 0.30)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      }
    },
  },
  plugins: [],
}
