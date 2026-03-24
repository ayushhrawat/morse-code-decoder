/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39ff14',
        'neon-cyan': '#00ffff',
        'dark-bg': '#0a0a0a',
        'dark-surface': '#1a1a1a',
      },
      fontFamily: {
        'mono': ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
