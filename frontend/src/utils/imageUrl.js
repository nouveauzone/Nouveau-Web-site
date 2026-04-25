const BASE = process.env.REACT_APP_BASE_URL || 'https://api.nouveauz.com';

export const fixImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  
  // Correctly route local dev URLs to production base URL
  if (url.startsWith('http://localhost')) {
    return url.replace(/http:\/\/localhost:\d+/, BASE);
  }
  
  // Handle both absolute and relative backend upload paths
  if (url.startsWith('/uploads')) {
    return BASE + url;
  }
  if (url.startsWith('uploads/')) {
    return BASE + '/' + url;
  }
  
  return url;
};

// Aliases in case something still relies on the old names temporarily
export const resolveImageUrl = fixImageUrl;
export const getImageUrl = fixImageUrl;
