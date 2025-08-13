export interface CloudinaryConfig {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
  uploadPreset?: string;
  defaultTransformations: {
    quality: number;
    format: string;
    responsive: boolean;
  };
}

export const cloudinaryConfig: CloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlfc3hhsr',
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  defaultTransformations: {
    quality: 80,
    format: 'auto',
    responsive: true
  }
};

export const validateCloudinaryUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'res.cloudinary.com' && 
           urlObj.pathname.includes('/upload/');
  } catch {
    return false;
  }
};

export const getCloudinaryPublicId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 2 >= pathParts.length) {
      return null;
    }
    
    return pathParts.slice(uploadIndex + 2).join('/');
  } catch {
    return null;
  }
};

export const buildCloudinaryUrl = (
  publicId: string,
  options: {
    transformations?: string;
    quality?: number;
    format?: string;
    responsive?: boolean;
  } = {}
): string => {
  const { transformations = '', quality = 80, format = 'auto', responsive = true } = options;
  
  let url = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  
  const allTransformations = [
    quality && `q_${quality}`,
    format !== 'auto' && `f_${format}`,
    responsive && 'c_scale,w_auto,dpr_auto',
    transformations
  ].filter(Boolean).join(',');
  
  if (allTransformations) {
    url += `/${allTransformations}`;
  }
  
  url += `/${publicId}`;
  
  return url;
};
