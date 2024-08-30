/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js}",
    "./node_modules/flowbite/**/*.js",
    'node_modules/flowbite-react/lib/esm/**/*.js',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}

