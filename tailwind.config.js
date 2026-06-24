/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // calm temple / parchment palette
        parchment: "#f6efe3",
        sand: "#efe4cf",
        ink: "#2b2118",
        saffron: "#c2622d",
        marigold: "#d98a3d",
        maroon: "#7a2e2e",
        sage: "#6b7355",
      },
      fontFamily: {
        // Devanagari-friendly stacks (Noto added at build if available; safe system fallbacks)
        deva: ['"Noto Sans Devanagari"', '"Mangal"', '"Nirmala UI"', "system-ui", "sans-serif"],
        shloka: ['"Noto Serif Devanagari"', '"Sanskrit Text"', '"Mangal"', "serif"],
      },
      keyframes: {
        breathe: { "0%,100%": { opacity: 0.45 }, "50%": { opacity: 1 } },
      },
      animation: { breathe: "breathe 1.6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
