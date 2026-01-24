/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Intella core */
        "intella-orange": {
          DEFAULT: "#f97316", // orange-500
          hover: "#ea580c",   // orange-600
        },

        "intella-sky": {
          from: "#bae6fd", // sky-200
          via: "#e0f2fe",  // sky-100
          to: "#ffffff",
        },
      },

      boxShadow: {
        "intella-card": "0 8px 24px rgba(0,0,0,0.06)",
        "intella-float": "0 16px 40px rgba(0,0,0,0.10)",
      },

      borderRadius: {
        intella: "1.25rem", // 20px – matches cards/buttons you shared
      },
    },
  },
  plugins: [],
}
