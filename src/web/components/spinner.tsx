import type React from 'react';

export type SpinnerProps = {
  size?: number | string;
  color?: string;
  duration?: '100' | '200' | '300' | '500' | '700' | '1000' | string;
  className?: string;
  label?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = '#56806d',
  duration = '700',
  className = '',
  label = 'Loading',
}) => {
  // Convert size to style string
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;

  // Build duration class (Tailwind convention: duration-{number})
  const durationClass = duration.startsWith('duration-')
    ? duration
    : `duration-${duration}`;

  return (
    <svg
      className={`inline-block shrink-0 ${className}`}
      width={sizeStyle}
      height={sizeStyle}
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      role='status'
      aria-label={label}
    >
      {/* Faint track circle */}
      <circle
        cx='12'
        cy='12'
        r='9'
        fill='none'
        stroke={color}
        strokeWidth='2'
        opacity='0.25'
      />
      {/* Spinning arc – uses Tailwind's animate-spin */}
      <circle
        cx='12'
        cy='12'
        r='9'
        fill='none'
        stroke={color}
        strokeWidth='2'
        strokeDasharray='31.4 31.4' // half circumference (2πr ≈ 62.8)
        strokeLinecap='round'
        className={`animate-spin ${durationClass} origin-center`}
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  );
};

export default Spinner;
