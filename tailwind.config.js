/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#F3B01C',
        dark: '#131417',
      },
      fontFamily: {
        Poppins_400Regular: ['Poppins_400Regular'],
        Poppins_500Medium: ['Poppins_500Medium'],
        Poppins_600SemiBold: ['Poppins_600SemiBold'],
        Poppins_700Bold: ['Poppins_700Bold'],
      },
    },
  },
  plugins: [],
};
