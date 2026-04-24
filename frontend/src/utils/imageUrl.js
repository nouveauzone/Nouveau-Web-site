const BASE = process.env.REACT_APP_BASE_URL || 'https://api.nouveauz.com';

export const fixImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http://localhost')) {
    return url.replace(/http:\/\/localhost:\d+/, BASE);
  }
  if (url.startsWith('/uploads')) {
    return BASE + url;
  }
  return url;
};

// Aliases in case something still relies on the old names temporarily
export const resolveImageUrl = fixImageUrl;
export const getImageUrl = fixImageUrl;
