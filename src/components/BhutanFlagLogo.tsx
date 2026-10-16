import React from 'react';

interface BhutanFlagLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
}

export const BhutanFlagLogo: React.FC<BhutanFlagLogoProps> = ({
  className = '',
  size = 'md',
  withGlow = false,
}) => {
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md ${
        sizeMap[size]
      } ${withGlow ? 'shadow-amber-500/25 ring-2 ring-amber-400/40' : ''} ${className}`}
    >
      <svg
        viewBox="0 0 300 200"
        className="h-full w-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="bhutan-clip">
            <rect width="300" height="200" rx="20" />
          </clipPath>
          <filter id="druk-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        <g clipPath="url(#bhutan-clip)">
          {/* Upper Golden Yellow Triangle */}
          <polygon points="0,0 300,0 0,200" fill="#FFB81C" />

          {/* Lower Deep Warm Orange Triangle */}
          <polygon points="300,0 300,200 0,200" fill="#FF4D00" />

          {/* Dividing Diagonal Accent Line */}
          <line x1="0" y1="200" x2="300" y2="0" stroke="#FFF7E6" strokeWidth="0.8" opacity="0.3" />

          {/* The White Druk (Thunder Dragon of Bhutan) */}
          <g filter="url(#druk-shadow)">
            {/* Dragon Body segments */}
            <path
              d="M 60 160 Q 90 135 125 140 Q 155 145 180 115 Q 205 85 240 75 Q 260 70 270 58 Q 255 52 235 62 Q 200 78 175 105 Q 145 138 115 130 Q 80 120 50 152 Z"
              fill="#FFFFFF"
              stroke="#2B2D42"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Tail Swirls */}
            <path
              d="M 50 152 Q 35 160 30 175 Q 42 178 55 168 Q 62 162 65 158"
              fill="#FFFFFF"
              stroke="#2B2D42"
              strokeWidth="2"
            />
            <path
              d="M 38 170 Q 25 182 22 192 Q 32 188 42 178"
              fill="#FFFFFF"
              stroke="#2B2D42"
              strokeWidth="1.8"
            />

            {/* Dragon Head */}
            <path
              d="M 240 75 C 248 68, 258 55, 272 56 C 278 57, 285 52, 288 42 C 282 46, 275 47, 268 46 C 265 38, 258 36, 250 42 C 242 48, 235 55, 230 65 Z"
              fill="#FFFFFF"
              stroke="#2B2D42"
              strokeWidth="2.2"
            />

            {/* Snout & Mouth */}
            <path
              d="M 288 42 Q 295 40 298 34 Q 288 36 280 40"
              fill="#FFFFFF"
              stroke="#2B2D42"
              strokeWidth="1.8"
            />
            <circle cx="265" cy="46" r="2.5" fill="#D90429" />
            <circle cx="266" cy="45" r="0.8" fill="#FFFFFF" />

            {/* Antlers / Crest */}
            <path
              d="M 252 38 Q 250 25 242 20 Q 248 26 254 34"
              stroke="#2B2D42"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 258 38 Q 262 26 268 18 Q 264 26 261 36"
              stroke="#2B2D42"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Front Left Claw holding Jewel (Norbu) */}
            <path
              d="M 215 90 L 235 110 L 245 105"
              fill="none"
              stroke="#2B2D42"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 235 110 L 242 118 M 235 110 L 230 120 M 235 110 L 245 112"
              stroke="#2B2D42"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Jewel 1 */}
            <circle cx="248" cy="116" r="8" fill="#F4F1DE" stroke="#2B2D42" strokeWidth="2" />
            <circle cx="246" cy="114" r="2.5" fill="#00F5D4" />

            {/* Front Right Claw */}
            <path
              d="M 180 115 L 195 140 L 208 142"
              fill="none"
              stroke="#2B2D42"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Jewel 2 */}
            <circle cx="214" cy="144" r="7.5" fill="#F4F1DE" stroke="#2B2D42" strokeWidth="2" />
            <circle cx="212" cy="142" r="2" fill="#7209B7" />

            {/* Back Left Claw */}
            <path
              d="M 125 140 L 120 170 L 132 178"
              fill="none"
              stroke="#2B2D42"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Jewel 3 */}
            <circle cx="138" cy="180" r="7" fill="#F4F1DE" stroke="#2B2D42" strokeWidth="2" />
            <circle cx="136" cy="178" r="2" fill="#3A86FF" />

            {/* Back Right Claw holding Jewel */}
            <path
              d="M 85 138 L 75 162 L 65 170"
              fill="none"
              stroke="#2B2D42"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Jewel 4 */}
            <circle cx="62" cy="174" r="6.5" fill="#F4F1DE" stroke="#2B2D42" strokeWidth="1.8" />
            <circle cx="60" cy="172" r="1.8" fill="#FFB703" />

            {/* Scales Pattern along body */}
            <path
              d="M 100 132 Q 105 137 110 132 M 130 134 Q 135 140 140 134 M 160 120 Q 166 126 172 120 M 190 98 Q 196 104 202 98 M 220 80 Q 225 86 230 80"
              stroke="#2B2D42"
              strokeWidth="1.6"
              fill="none"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
