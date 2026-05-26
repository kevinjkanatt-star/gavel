module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFDF7',
        foreground: '#171717',
        primary: {
          DEFAULT: '#7C1D2B',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C9A84C',
          primary: '#6D071A',
          wine: '#800020',
          gold: '#D4AF37',
          warning: '#D4AF37',
          danger: '#FF3B30',
          success: '#00C853',
        },
        border: {
          DEFAULT: '#E5E5E5',
          default: '#E5E5E5',
          focus: '#111111',
        },
        text: {
          primary: '#171717',
          secondary: '#57534E',
          inverse: '#FFFFFF',
          accent: '#6D071A',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '4px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
