/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'oklch(0.97 0.012 248)',
          raised: 'oklch(0.99 0.008 248)',
          alt: 'oklch(0.94 0.018 248)',
        },
        ink: {
          DEFAULT: 'oklch(0.28 0.04 265)',
          soft: 'oklch(0.42 0.03 265)',
        },
        accent: {
          DEFAULT: 'oklch(0.58 0.14 195)',
          deep: 'oklch(0.48 0.12 200)',
          ring: 'oklch(0.62 0.08 195)',
        },
        border: {
          DEFAULT: 'oklch(0.88 0.02 248)',
        },
        complete: {
          DEFAULT: 'oklch(0.52 0.1 155)',
          bg: 'oklch(0.94 0.04 155)',
        },
        away: {
          DEFAULT: 'oklch(0.55 0.1 75)',
          bg: 'oklch(0.95 0.05 75)',
          text: 'oklch(0.42 0.1 55)',
        },
        unlock: {
          DEFAULT: 'oklch(0.55 0.12 55)',
          bg: 'oklch(0.985 0.02 55)',
          border: 'oklch(0.9 0.04 55)',
          badge: 'oklch(0.95 0.05 55)',
          'badge-text': 'oklch(0.4 0.1 45)',
        },
        likely: {
          bg: 'oklch(0.93 0.04 195)',
        },
        possible: {
          bg: 'oklch(0.94 0.02 248)',
        },
        shell: {
          header: 'oklch(0.32 0.045 258)',
          footer: 'oklch(0.94 0.014 248)',
          ink: 'oklch(0.96 0.015 248)',
          'ink-muted': 'oklch(0.92 0.02 248)',
          'footer-text': 'oklch(0.45 0.03 265)',
        },
        nav: {
          hover: 'oklch(0.4 0.04 258 / 0.55)',
          'active-bg': 'oklch(0.42 0.06 200 / 0.45)',
          'active-border': 'oklch(0.72 0.1 195 / 0.45)',
        },
        flavor: {
          balance: 'oklch(0.96 0.03 85)',
          'balance-edge': 'oklch(0.88 0.04 85)',
          aromatic: 'oklch(0.96 0.03 145)',
          'aromatic-edge': 'oklch(0.88 0.045 145)',
          impression: 'oklch(0.96 0.03 210)',
          'impression-edge': 'oklch(0.88 0.045 210)',
          texture: 'oklch(0.96 0.025 320)',
          'texture-edge': 'oklch(0.88 0.04 320)',
        },
      },
      fontFamily: {
        body: ['Chivo', 'system-ui', 'sans-serif'],
        script: ['"Playwrite AU QLD"', 'cursive'],
      },
      maxWidth: {
        discover: '52rem',
        cabinet: '48rem',
        shell: '72rem',
      },
      keyframes: {
        'discover-rise': {
          from: { opacity: '0', transform: 'translateY(0.4rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'discover-rise': 'discover-rise 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
