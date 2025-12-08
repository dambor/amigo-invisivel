import React from 'react';

interface SantaGiftIconProps {
  className?: string;
}

export const SantaGiftIcon: React.FC<SantaGiftIconProps> = ({ className }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Gift Icon Base */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-full h-full"
      >
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
      </svg>
      
      {/* Santa Hat Overlay */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute -top-[55%] -left-[35%] w-[110%] h-[110%] pointer-events-none filter drop-shadow-sm"
      >
        {/* Red Body (Floppy shape) */}
        <path 
            d="M 82 72 C 75 10 35 0 12 50 L 35 72 Z"
            fill="#EF4444" 
            stroke="#991B1B" 
            strokeWidth="2"
        />
        
        {/* Pompom */}
        <circle cx="12" cy="50" r="9" fill="white" stroke="#E5E7EB" strokeWidth="2" />
        
        {/* White Brim */}
        <rect x="28" y="68" width="56" height="15" rx="6" fill="white" stroke="#E5E7EB" strokeWidth="2" />
      </svg>
    </div>
  );
};