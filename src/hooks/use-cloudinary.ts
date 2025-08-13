import { useState, useCallback } from 'react';
import { buildCloudinaryUrl, validateCloudinaryUrl } from '@/lib/cloudinary-config';

interface UseCloudinaryOptions {
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  transformations?: string;
  responsive?: boolean;
}

export function useCloudinary() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateUrl = useCallback((
    originalUrl: string,
    options: UseCloudinaryOptions = {}
  ): string => {
    if (!validateCloudinaryUrl(originalUrl)) {
      return originalUrl;
    }

    try {
      const url = new URL(originalUrl);
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1 || uploadIndex + 2 >= pathParts.length) {
        return originalUrl;
      }
      
      const publicId = pathParts.slice(uploadIndex + 2).join('/');
      return buildCloudinaryUrl(publicId, options);
    } catch (err) {
      console.error('Error generating Cloudinary URL:', err);
      return originalUrl;
    }
  }, []);

  const generateResponsiveUrls = useCallback((
    originalUrl: string,
    breakpoints: { [key: string]: number } = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
  ): { [key: string]: string } => {
    if (!validateCloudinaryUrl(originalUrl)) {
      return { default: originalUrl };
    }

    const urls: { [key: string]: string } = {};
    
    Object.entries(breakpoints).forEach(([breakpoint, width]) => {
      urls[breakpoint] = generateUrl(originalUrl, {
        transformations: `c_scale,w_${width}`,
        quality: 80,
        responsive: false
      });
    });

    urls.default = generateUrl(originalUrl, { responsive: true });
    
    return urls;
  }, [generateUrl]);

  const uploadImage = useCallback(async (
    file: File,
    options: {
      folder?: string;
      publicId?: string;
      transformations?: string;
    } = {}
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateUrl,
    generateResponsiveUrls,
    uploadImage,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}
