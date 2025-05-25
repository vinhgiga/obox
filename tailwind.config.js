/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // This enables dark mode with the 'dark' class
  theme: {
    extend: {
      fontFamily: {
        // title: ["Lexend", "sans-serif"],
        main: ["Arial", "sans-serif"],
        logo: ["Lexend", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
