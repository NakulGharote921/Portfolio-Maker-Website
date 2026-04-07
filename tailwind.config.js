import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        glow: '0 24px 80px rgba(14, 165, 233, 0.18)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top left, rgba(14, 165, 233, 0.22), transparent 30%), radial-gradient(circle at top right, rgba(244, 114, 182, 0.16), transparent 25%), linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.65))',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['light', 'dark'],
  },
}
