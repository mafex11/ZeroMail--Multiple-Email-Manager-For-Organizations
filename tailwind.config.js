/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        'gmail-blue': '#0B57D0',
        'gmail-hover': '#F2F2F2',
        'gmail-gray': '#5F6368',
        'gmail-light': '#f8f9fa',
      },
      animation: {
        'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
      },
    },
  },
  plugins: [],
} 