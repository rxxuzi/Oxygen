import React from 'react';

interface OxygenIconProps {
  className?: string;
  size?: number;
}

export function OxygenIcon({ className = '', size = 24 }: OxygenIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 180 180"
      width={size}
      height={size}
      className={className}
    >
      <circle cx="65" cy="104" r="65" fill="black" opacity="0.2" transform="translate(4, 4)"/>
      <circle cx="65" cy="104" r="65" fill="#0044cc"/>
      <path d="M45 72 L93 105.5 L45 139 Z" fill="white"/>
      <path d="M120 107 L158 53.5 L139 53.5 L139 0 L101 0 L101 53.5 L82 53.5 Z" 
            fill="#36F34F"/>
    </svg>
  );
}

export function DownloadIcon({ className = '', size = 16 }: OxygenIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={size} 
      height={size}
      className={className}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

export function ChevronDownIcon({ className = '', size = 16 }: OxygenIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={size} 
      height={size}
      className={className}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  );
}