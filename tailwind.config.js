/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green-primary': '#22C55E',
        'green-light': '#DCFCE7',
        'grey-1': '#F5F5F5',
        'grey-2': '#E5E5E5',
        'grey-3': '#D4D4D4',
        'grey-4': '#A3A3A3',
        'grey-5': '#737373',
      },
      boxShadow: {
        'sheet': '0 -4px 20px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
