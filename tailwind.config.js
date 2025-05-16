/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gmail-blue': '#1a73e8',
        'gmail-hover': '#1557b0',
        'gmail-gray': '#5f6368',
        'gmail-light': '#f8f9fa',
      },
    },
  },
  plugins: [],
} 