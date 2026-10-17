import React from 'react';

interface BhutanFlagLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
  shape?: 'rounded' | 'circle' | 'flag';
}

export const BhutanFlagLogo: React.FC<BhutanFlagLogoProps> = ({
  className = '',
  size = 'md',
  withGlow = false,
  shape = 'rounded',
}) => {
  const sizeMap = {
    xs: 'h-5 w-5',
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const shapeMap = {
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    flag: 'rounded-lg aspect-[3/2]',
  };

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-amber-500/40 bg-slate-900 shadow-md ${
        sizeMap[size]
      } ${shapeMap[shape]} ${
        withGlow ? 'shadow-amber-500/30 ring-2 ring-amber-400/50' : ''
      } ${className}`}
    >
      <img
        src="/flag_of_bhutan.svg"
        alt="Official Flag of Bhutan - Duba AI Logo"
        className="h-full w-full object-cover object-center select-none"
        draggable={false}
      />
    </div>
  );
};
