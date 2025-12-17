/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#FFC107",
        "primary-dark": "#FFB300",
        "background-dark": "#121212",
        "surface-dark": "#1E1E1E",
        "surface-lighter": "#2C2C2C",
        "text-secondary": "#A0A0A0",
        "border-dark": "#333333",
        "danger": "#EF4444",
        "success": "#4CAF50",
        "warning": "#F59E0B"
      },
      fontFamily: {
        "display": ["Outfit", "Lexend", "sans-serif"],
        "body": ["Inter", "Noto Sans", "sans-serif"]
      },
    },
  },
  plugins: [],
}
