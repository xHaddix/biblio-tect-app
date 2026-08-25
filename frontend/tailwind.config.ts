import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          'bg-page': '#fdfbf9',
          dark: '#2c1a10',
          accent: '#a0522d',
          'accent-hover': '#8b4513',
          card: '#ffffff',
          'text-dark': '#1c1c1c',
          'text-light': '#f5eeda',
          border: '#e3d5c1',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
