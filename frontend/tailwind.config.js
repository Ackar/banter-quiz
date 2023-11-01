/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Fjalla One"', "serif"],
        titan: ['"Titan One"'],
      },
    },
  },
  plugins: [],
};
