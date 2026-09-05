/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'oklch(0.975 0.013 220)',
          raised: 'oklch(0.995 0.006 220)',
          alt: 'oklch(0.945 0.022 220)',
          wash: 'oklch(0.91 0.035 202)',
        },
        ink: {
          DEFAULT: 'oklch(0.24 0.045 252)',
          soft: 'oklch(0.42 0.035 252)',
          muted: 'oklch(0.56 0.03 252)',
        },
        accent: {
          DEFAULT: 'oklch(0.58 0.13 190)',
          deep: 'oklch(0.43 0.11 198)',
          ring: 'oklch(0.66 0.09 190)',
          warm: 'oklch(0.63 0.13 52)',
          blush: 'oklch(0.76 0.09 12)',
        },
        border: {
          DEFAULT: 'oklch(0.86 0.024 220)',
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
          header: 'oklch(0.985 0.01 220 / 0.92)',
          footer: 'oklch(0.94 0.016 220)',
          ink: 'oklch(0.24 0.045 252)',
          'ink-muted': 'oklch(0.43 0.035 252)',
          'footer-text': 'oklch(0.45 0.03 252)',
        },
        nav: {
          hover: 'oklch(0.94 0.025 205)',
          'active-bg': 'oklch(0.9 0.04 192)',
          'active-border': 'oklch(0.72 0.1 192)',
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
        body: ['Avenir Next', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
        display: ['Georgia', 'Iowan Old Style', 'serif'],
        script: ['Georgia', 'Iowan Old Style', 'serif'],
      },
      maxWidth: {
        discover: '52rem',
        detail: '68rem',
        cabinet: '48rem',
        shell: '76rem',
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
