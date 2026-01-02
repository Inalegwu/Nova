import { createStitches } from '@stitches/react';

export const { styled, css, globalCss, theme } = createStitches({
  theme: {
    colors: {
      primary50: '#ffffff',
      primary150: '#ffffff',
      primary250: '#ffffff',
      primary350: '#dcedff',
      primary450: '#b8c9ff',
      primary550: '#94a5df',
      primary650: '#7081bb',
      primary750: '#4c5d97',
      primary850: '#283973',
      primary950: '#04154f',
      primary1050: '#00002b',
      primary1150: '#000007',
      primary1250: '#000000',
    },
    fonts: {
      body: 'Font',
    },
    fontSizes: {
      xs: '1.21rem',
      sm: '1.29rem',
      md: '1.38rem',
      lg: '1.47rem',
      xl: '1.57rem',
      '2xl': '1.66rem',
      '3xl': '1.79rem',
      '4xl': '1.90rem',
      '5xl': '2.04rem',
    },
  },
});
