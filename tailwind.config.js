/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        accent: '#3B82F6',
        darkText: '#111827',
        grayText: '#6B7280',
        lightBg: '#F9FAFB',
        whiteBg: '#FFFFFF',
        darkBg: '#0F172A',
        brand2: '#E5E7EB',
      },
    },
  },
  plugins: [],
};
