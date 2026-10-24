/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        jet: '#000000',
        jetcard: '#0a0a0a',
        jetborder: '#1a1a1a',
        charcoal: '#1E1B16',
        charcoal2: '#2A251E',
        cream: '#F5F1E8',
        mustard: '#E8A33D',
        chili: '#B5432B',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        body: ['-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
