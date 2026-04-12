interface WadAlHalalAvatarProps {
  size?: number;
  className?: string;
}

const WadAlHalalAvatar = ({ size = 120, className = "" }: WadAlHalalAvatarProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="100" cy="100" r="96" fill="hsl(142, 60%, 30%)" opacity="0.1" />
      <circle cx="100" cy="100" r="96" stroke="hsl(142, 60%, 30%)" strokeWidth="2" opacity="0.3" />
      <rect x="85" y="135" width="30" height="20" rx="4" fill="#8B6914" />
      <path d="M60 155 Q65 145 85 148 L85 175 Q72 175 60 180 Z" fill="hsl(142, 60%, 30%)" />
      <path d="M140 155 Q135 145 115 148 L115 175 Q128 175 140 180 Z" fill="hsl(142, 60%, 30%)" />
      <rect x="75" y="148" width="50" height="32" rx="4" fill="hsl(142, 60%, 35%)" />
      <path d="M92 148 L100 160 L108 148" fill="hsl(142, 55%, 28%)" />
      <ellipse cx="100" cy="110" rx="38" ry="42" fill="#A0722A" />
      <ellipse cx="100" cy="72" rx="46" ry="28" fill="#FAF8F0" />
      <path d="M54 72 Q54 50 100 44 Q146 50 146 72 Q146 62 100 58 Q54 62 54 72Z" fill="#FFFFFF" />
      <path d="M58 72 Q70 65 100 63 Q130 65 142 72" stroke="#E8E4D8" strokeWidth="1.5" fill="none" />
      <path d="M62 78 Q75 72 100 70 Q125 72 138 78" stroke="#E8E4D8" strokeWidth="1" fill="none" />
      <path d="M140 70 Q148 75 145 95 Q143 105 138 110" stroke="#FAF8F0" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M140 70 Q148 75 145 95 Q143 105 138 110" stroke="#E8E4D8" strokeWidth="1" fill="none" />
      <ellipse cx="85" cy="105" rx="6" ry="7" fill="white" />
      <ellipse cx="115" cy="105" rx="6" ry="7" fill="white" />
      <circle cx="86" cy="105" r="3.5" fill="#2D1B00" />
      <circle cx="116" cy="105" r="3.5" fill="#2D1B00" />
      <circle cx="87.5" cy="103.5" r="1.2" fill="white" />
      <circle cx="117.5" cy="103.5" r="1.2" fill="white" />
      <path d="M77 96 Q85 92 93 96" stroke="#3D2200" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M107 96 Q115 92 123 96" stroke="#3D2200" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M85 122 Q100 134 115 122" stroke="#6B3A00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M97 110 Q100 116 103 110" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M80 160 Q78 170 82 178" stroke="#555" strokeWidth="2" fill="none" />
      <circle cx="82" cy="180" r="4" fill="#777" stroke="#555" strokeWidth="1.5" />
      <circle cx="82" cy="180" r="1.5" fill="#999" />
    </svg>
  );
};

export default WadAlHalalAvatar;
