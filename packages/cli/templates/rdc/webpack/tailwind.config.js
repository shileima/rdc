/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'main-bg-gradient': 'linear-gradient(135deg, #F1F0FC 0%, white 50%, #F1F0FC 100%)',
        'ai-img': 'linear-gradient(225deg, #2137FF 0%, #6CBDFF 100%)',
      },
    },
  },
  plugins: [],
};
