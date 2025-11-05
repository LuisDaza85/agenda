/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Colores primarios de la marca
        brand: {
          purple: {
            DEFAULT: "#341A67",
            light: "#584291",
          },
          blue: {
            light: "#47B4D8",
            lighter: "#A8DAED",
            DEFAULT: "#009ED0",
          },
        },
        // Colores secundarios
        accent: {
          orange: "#E67012",
          yellow: "#EFBE00",
          "orange-alt": "#EB8F00",
          "yellow-green": "#BDCC00",
          green: "#9AC040",
          "green-bright": "#72AE17",
          "red-orange": "#DF491F",
          red: "#D60035",
          magenta: "#A60054",
        },
        // Mantener primary para compatibilidad
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#341A67",
          700: "#584291",
          800: "#2d1654",
          900: "#1e0f3a",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
