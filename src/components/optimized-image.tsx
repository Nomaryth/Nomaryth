'use client';

import Image from 'next/image';
import { useState } from 'react';
import { fallbackImageUrl, isValidImageUrl } from '@/lib/image-config';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  disableFallback?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 75,
  sizes,
  disableFallback = false,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (disableFallback) {
      setHasError(true);
      return;
    }
    if (!hasError && imgSrc !== fallbackImageUrl) {
      setImgSrc(fallbackImageUrl);
      setHasError(true);
    }
  };

  const validSrc = isValidImageUrl(imgSrc) || disableFallback ? imgSrc : fallbackImageUrl;

  return (
    <Image
      src={validSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      quality={quality}
      sizes={sizes}
      onError={handleError}
      {...props}
    />
  );
} 