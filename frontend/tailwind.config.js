/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4f46e5', // Indigo
          dark: '#818cf8'   // Light indigo for dark mode
        },
        secondary: {
          light: '#10b981', // Emerald
          dark: '#34d399'   // Light emerald for dark mode
        },
        accent: {
          light: '#8b5cf6', // Violet
          dark: '#a78bfa'   // Light violet for dark mode
        },
        background: {
          light: '#f3f4f6', // Light gray
          dark: '#1f2937'   // Dark gray
        },
        card: {
          light: '#ffffff', // White
          dark: '#374151'   // Medium gray
        },
        text: {
          light: '#1f2937', // Dark gray
          dark: '#f9fafb'   // Near white
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 5px 25px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} 