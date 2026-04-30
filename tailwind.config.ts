import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        white: '#faf9f7',
        paper: '#f4f2ee',
        paper2: '#eeeae2',
        ink: '#141210',
        ink2: '#2a2724',
        muted: '#6e6a64',
        faint: '#e8e4dc',
        rule: '#dedad2',
        green: {
          DEFAULT: '#1c3d2c',
          2: '#2a5c40',
          l: '#edf4f0',
          m: '#d0e9da',
        },
        amber: {
          DEFAULT: '#e8a020',
          l: '#fdf4e7',
        },
        red: {
          DEFAULT: '#c0392b',
          l: '#fdf0ee',
        },
        blue: {
          DEFAULT: '#1a4a7a',
          l: '#eef4fc',
        },
      },
      fontFamily: {
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
