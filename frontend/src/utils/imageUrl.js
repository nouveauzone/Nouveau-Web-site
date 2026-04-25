import API from '../config/api';

const getApiBaseProxy = (base) => {
  const normalized = String(base || "").replace(/\/+$/, "");
  return normalized ? `${normalized}/api` : "/api";
};

// We dynamically rely on the active production API proxy rather than a broken SSL subdomain.
const BASE_API = getApiBaseProxy(API);

export const fixImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  
  // If the path contains /uploads/, extract everything after it and pipe it through the proxy
  if (url.includes('/uploads/')) {
    const cleanPath = url.split('/uploads/')[1];
    if (cleanPath) {
      return `${BASE_API}/uploads/${cleanPath}`;
    }
  }

  // Catch relative edge cases like "uploads/..."
  if (url.startsWith('uploads/')) {
    const cleanPath = url.replace(/^uploads\//, '');
    return `${BASE_API}/uploads/${cleanPath}`;
  }
  
  return url;
};

// Aliases in case something still relies on the old names temporarily
export const resolveImageUrl = fixImageUrl;
export const getImageUrl = fixImageUrl;
