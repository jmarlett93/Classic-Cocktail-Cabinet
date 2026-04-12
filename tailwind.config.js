/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'ctl-',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
