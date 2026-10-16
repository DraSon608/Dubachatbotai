import React from 'react';

interface BhutanFlagLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
  onClick?: () => void;
  title?: string;
}

export const BhutanFlagLogo: React.FC<BhutanFlagLogoProps> = ({
  className = '',
  size = 'md',
  withGlow = false,
  onClick,
  title = 'Official Flag of Bhutan (འབྲུག་གི་རྒྱལ་དར)',
}) => {
  const sizeMap = {
    xs: 'h-5 w-7',
    sm: 'h-6 w-9',
    md: 'h-8 w-12',
    lg: 'h-11 w-16',
    xl: 'h-16 w-24',
  };

  return (
    <div
      onClick={onClick}
      title={title}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-md border border-amber-500/40 bg-slate-900 transition-all ${
        sizeMap[size]
      } ${
        withGlow
          ? 'shadow-amber-500/30 ring-1 ring-amber-400/50 hover:shadow-amber-500/50'
          : 'hover:border-amber-400/60'
      } ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${className}`}
    >
      <img
        src="/bhutan-flag.svg"
        alt="Official Flag of Bhutan (འབྲུག་གི་རྒྱལ་དར)"
        className="h-full w-full object-cover select-none pointer-events-none"
        loading="eager"
      />
    </div>
  );
};
