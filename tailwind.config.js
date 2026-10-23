/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sandstone: {
          950: '#15100d', // Deepest Flatiron shadow
          900: '#211813', // Main card background
          800: '#33261e', // Card border & subtle highlights
          700: '#4a372c', // Input borders & dividers
          400: '#ab9585', // Muted text
          200: '#d9cdc1', // Secondary text
          100: '#f4efe9', // Primary parchment text
        },
        flatiron: {
          red: '#c04a29',   // Classic Flatiron iron-oxide red
          rust: '#993418',  // Darker terracotta
          ochre: '#d97706', // Warm golden sandstone
          gold: '#f59e0b',  // FKT / Record rank highlight
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Garamond', 'Times New Roman', 'serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['"Trebuchet MS"', 'Geneva', 'Tahoma', 'sans-serif'],
      }
    },
  },
  plugins: [],
}