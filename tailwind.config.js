/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        hub: {
          bg: '#f8fafc',
          surface: '#ffffff',
          'surface-alt': '#f1f5f9',
          border: '#e2e8f0',
          'border-strong': '#cbd5e1',
          primary: '#0f172a',
          'primary-hover': '#1e293b',
          accent: '#c2410c',
          'accent-subtle': '#fff7ed',
          text: '#0f172a',
          muted: '#64748b',
          subtle: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
        'modal': '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
}
