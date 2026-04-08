/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#11131A',
        'surface': 'rgba(255,255,255,0.05)',
        'surface-high': 'rgba(255,255,255,0.08)',
        'primary': '#FF3B3B',
        'primary-dim': '#CC2020',
        'text-secondary': '#9CA3AF',
        'ghost': 'rgba(255,255,255,0.12)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
