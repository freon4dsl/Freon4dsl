import flowbitePlugin from 'flowbite/plugin';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}',
            './src/lib/**/*.{html,js,svelte,ts}'
  ],
  safelist: [
    'text-center',  
    'rounded-full',
    {
      pattern: /bg-primary-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['lg', 'hover', 'focus', 'lg:hover'],
    },
    {
      pattern: /border-primary-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['lg', 'hover', 'focus', 'lg:hover'],
    },
    {
      pattern: /w-(1|2|3|4|5|6|7|8|9)/
    },
    {
      pattern: /h-(1|2|3|4|5|6|7|8|9)/
    },
    {
      pattern: /px-(1|2|2.5|3|4|5|6|7|8|9)/
    },
    {
      pattern: /py-(1|2|2.5|3|4|5|6|7|8|9)/
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          ...defaultTheme.colors.primary, // If primary is a color in the default theme you want to extend
          50: '#ECEEF5',
          100: '#D9DDEB',
          200: '#C6CCE2',
          300: '#B3BBD8',
          400: '#A0AACF',
          500: '#8D99C5',
          600: '#7B89BC',
          700: '#6878B2',
          800: '#5567A8',
          900: '#4C5C96'
        },
      },
      width: {
        '4.5': '1.125rem'
      },
      height: { 
        '4.5': '1.125rem'
      },
    },
  },
  plugins: [
    flowbitePlugin, // Add Flowbite plugin here
  ],
};
