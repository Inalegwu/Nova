import { styled } from '@/web/stitches.config';

export const Text = styled('p', {
  fontFamily: 'Font',
  fontWeight: 'normal',
  color: '$primary1250',
  variants: {
    size: {
      heading: {
        fontSize: '$3xl',
        fontWeight: 'bold',
      },
    },
  },
});
