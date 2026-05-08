/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Cascadia Code"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            fontFamily: theme('fontFamily.sans').join(', '),
            code: {
              fontFamily: theme('fontFamily.mono').join(', '),
              fontWeight: '400',
              fontSize: '0.875em',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
