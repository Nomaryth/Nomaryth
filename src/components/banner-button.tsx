'use client';

import Link from 'next/link';
import { useState } from 'react';
import { OptimizedImage } from './optimized-image';

interface BannerButtonProps {
  imageSrc: string;
  imageAlt: string;
  frontText: string;
  backText: string;
  href: string;
  className?: string;
  icon?: React.ReactNode;
}

export function BannerButton({ 
  imageSrc, 
  imageAlt, 
  frontText, 
  backText, 
  href, 
  className = '',
  icon 
}: BannerButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href={href}
      className={`banner-button relative block w-full h-48 md:h-64 overflow-hidden rounded-lg transition-all duration-500 hover:scale-105 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <OptimizedImage
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover transition-all duration-500"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      <div className="absolute inset-0 bg-black/40 transition-all duration-500" />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isHovered ? 'opacity-0 translate-y-1/2 rotate-x-90' : 'opacity-100 translate-y-0 rotate-x-0'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="text-center text-white">
              {icon && <div className="mb-2 text-4xl">{icon}</div>}
              <h3 className="text-xl md:text-2xl font-bold mb-2">{frontText}</h3>
              <p className="text-sm md:text-base opacity-90">Passe o mouse para ver mais</p>
            </div>
          </div>
          
          <div 
            className={`absolute inset-0 flex items-center justify-center bg-accent/90 text-accent-foreground transition-all duration-500 ${
              isHovered ? 'opacity-100 translate-y-0 rotate-x-0' : 'opacity-0 -translate-y-1/2 -rotate-x-90'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-2">{backText}</h3>
              <p className="text-sm md:text-base">Clique para acessar</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000 ease-out" />
    </Link>
  );
}

const bannerButtonStyles = `
  .banner-button {
    position: relative;
    display: block;
    text-decoration: none;
    overflow: hidden;
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  .banner-button:hover .absolute {
    backface-visibility: hidden;
  }

  .banner-button .rotate-x-90 {
    transform: rotateX(90deg);
  }

  .banner-button .-rotate-x-90 {
    transform: rotateX(-90deg);
  }

  .banner-button .translate-y-1\\/2 {
    transform: translateY(50%);
  }

  .banner-button .-translate-y-1\\/2 {
    transform: translateY(-50%);
  }

  .banner-button:hover .bg-gradient-to-r {
    transform: translateX(100%);
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = bannerButtonStyles;
  document.head.appendChild(style);
} 