/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT: '#E8470A', dark: '#C73D09', light: '#FF5A1A' },
        surface: '#F5F5F5',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      screens: { xs: '480px' },
    },
  },
  plugins: [],
};
