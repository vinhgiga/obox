/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ['Lexend', 'sans-serif'],
        main: ['Arial', 'sans-serif'],
        logo: ['Lexend', 'sans-serif'],
      }
    },
  },
  plugins: [],
}