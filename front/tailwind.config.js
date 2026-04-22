/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx}', './screens/**/*.{js,jsx}', './services/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
