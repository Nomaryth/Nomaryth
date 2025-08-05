'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FlipButtonProps {
  frontText: string;
  backText: string;
  href: string;
  className?: string;
  icon?: React.ReactNode;
}

export function FlipButton({ 
  frontText, 
  backText, 
  href, 
  className = '',
  icon 
}: FlipButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href={href}
      className={`btn-flip relative inline-block text-center text-white font-bold uppercase tracking-wider transition-all duration-500 hover:scale-105 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative block w-full h-full">
        <span 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
            isHovered ? 'opacity-0 translate-y-1/2 rotate-x-90' : 'opacity-100 translate-y-0 rotate-x-0'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {frontText}
        </span>
        
        <span 
          className={`absolute inset-0 flex items-center justify-center bg-accent text-accent-foreground transition-all duration-500 ${
            isHovered ? 'opacity-100 translate-y-0 rotate-x-0' : 'opacity-0 -translate-y-1/2 -rotate-x-90'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {backText}
        </span>
      </span>
    </Link>
  );
}

const flipButtonStyles = `
  .btn-flip {
    position: relative;
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
    border: 2px solid hsl(var(--accent));
    border-radius: 8px;
    color: hsl(var(--accent-foreground));
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-decoration: none;
    overflow: hidden;
    transition: all 0.3s ease;
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  .btn-flip:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  .btn-flip::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .btn-flip:hover::before {
    left: 100%;
  }

  .btn-flip span {
    position: relative;
    z-index: 1;
  }

  .btn-flip .absolute {
    backface-visibility: hidden;
  }

  .btn-flip .rotate-x-90 {
    transform: rotateX(90deg);
  }

  .btn-flip .-rotate-x-90 {
    transform: rotateX(-90deg);
  }

  .btn-flip .translate-y-1\\/2 {
    transform: translateY(50%);
  }

  .btn-flip .-translate-y-1\\/2 {
    transform: translateY(-50%);
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = flipButtonStyles;
  document.head.appendChild(style);
} 