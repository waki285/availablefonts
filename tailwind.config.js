/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx,scss}"],
  theme: {
    extend: {},
    fontFamily: {
      display: ["Lobster", "cursive"],
      sans: ["Lato", "sans-serif"],
    }
  },
  safelist: [
    "italic",
  ],
  plugins: [],
}

