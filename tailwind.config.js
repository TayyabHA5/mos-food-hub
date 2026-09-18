/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#1E1B16',
        charcoal2: '#2A251E',
        cream: '#F5F1E8',
        mustard: '#E8A33D',
        chili: '#B5432B',
      },
      fontFamily: {
        // Display font: headings ke liye ek serif jo bold/warm lagta hai.
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        // Body font: normal text ke liye clean sans-serif.
        body: ['-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
