module.exports = {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.html",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/utils/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Tu peux ajouter tes couleurs personnalisées ici
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        bruno: ["Bruno Ace SC", "sans-serif"],
      },
    },
  },
  plugins: [],
};
