import API from '../config/api';

export const fixImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  
  // Handled nested arrays occasionally passed down as single elements
  let targetUrl = url;
  if (Array.isArray(url)) {
    targetUrl = url[0];
  }
  if (typeof targetUrl !== 'string' || !targetUrl) {
    return '/placeholder.png';
  }
  
  // Directly point to the root uploads directory which natively bypasses the SSL issue and connects directly
  if (targetUrl.includes('/uploads/')) {
    const cleanPath = targetUrl.split('/uploads/')[1];
    if (cleanPath) {
      return `/uploads/${cleanPath}`;
    }
  }

  // Catch relative edge cases like "uploads/..."
  if (targetUrl.startsWith('uploads/')) {
    const cleanPath = targetUrl.replace(/^uploads\//, '');
    return `/uploads/${cleanPath}`;
  }
  
  return targetUrl;
};

// Aliases in case something still relies on the old names temporarily
export const resolveImageUrl = fixImageUrl;
export const getImageUrl = fixImageUrl;
