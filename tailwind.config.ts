import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EE',
        creamDeep: '#F1E6D3',
        gold: '#B08D57',
        goldDark: '#8C6F42',
        goldPale: '#E4D3B4',
        ink: '#221F1D',
        inkSoft: '#55504A',
        whatsapp: '#3FA34D',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        script: ['var(--font-script)', 'cursive'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
