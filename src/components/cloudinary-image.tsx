'use client';

import { useState } from 'react';
import { OptimizedImage } from './optimized-image';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  transformations?: string;
  responsive?: boolean;
  fallbackSrc?: string;
  sizes?: string;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 80,
  format = 'auto',
  transformations = '',
  responsive = true,
  fallbackSrc,
  sizes,
  ...props
}: CloudinaryImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isCloudinaryUrl = src.includes('cloudinary.com');

  if (!isCloudinaryUrl) {
    return (
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={className}
        priority={priority}
        {...props}
      />
    );
  }

  const generateCloudinaryUrl = (baseUrl: string, options: {
    quality?: number;
    format?: string;
    transformations?: string;
    responsive?: boolean;
  } = {}) => {
    try {
      const url = new URL(baseUrl);
      const pathParts = url.pathname.split('/');
      
      if (pathParts.length < 7) return baseUrl;
      
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return baseUrl;
      
      const version = pathParts[uploadIndex + 1];
      const publicId = pathParts.slice(uploadIndex + 2).join('/');
      
      let transformations = '';
      
      if (options.quality) {
        transformations += `q_${options.quality},`;
      }
      
      if (options.format && options.format !== 'auto') {
        transformations += `f_${options.format},`;
      }
      
      if (options.transformations) {
        transformations += options.transformations + ',';
      }
      
      if (options.responsive) {
        transformations += 'c_scale,w_auto,dpr_auto,';
      }
      
      if (transformations.endsWith(',')) {
        transformations = transformations.slice(0, -1);
      }
      
      return `https://res.cloudinary.com/dlfc3hhsr/image/upload/${transformations ? transformations + '/' : ''}${version}/${publicId}`;
    } catch (error) {
      console.error('Error parsing Cloudinary URL:', error);
      return baseUrl;
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const finalSrc = hasError && fallbackSrc ? fallbackSrc : generateCloudinaryUrl(src, {
    quality,
    format,
    transformations,
    responsive
  });

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}
      
      <OptimizedImage
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        sizes={fill ? (sizes ?? '(max-width: 1024px) 100vw, 50vw') : sizes}
        disableFallback={!fallbackSrc}
        {...props}
      />
    </div>
  );
}
