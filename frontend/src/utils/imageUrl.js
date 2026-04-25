import API from '../config/api';

const getApiBaseProxy = (base) => {
  const normalized = String(base || "").replace(/\/+$/, "");
  return normalized ? `${normalized}/api` : "/api";
};

// We dynamically rely on the active production API proxy rather than a broken SSL subdomain.
const BASE_API = getApiBaseProxy(API);

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
  
  // If the path contains /uploads/, extract everything after it and pipe it through the proxy
  if (targetUrl.includes('/uploads/')) {
    const cleanPath = targetUrl.split('/uploads/')[1];
    if (cleanPath) {
      return `${BASE_API}/uploads/${cleanPath}`;
    }
  }

  // Catch relative edge cases like "uploads/..."
  if (targetUrl.startsWith('uploads/')) {
    const cleanPath = targetUrl.replace(/^uploads\//, '');
    return `${BASE_API}/uploads/${cleanPath}`;
  }
  
  return targetUrl;
};

// Aliases in case something still relies on the old names temporarily
export const resolveImageUrl = fixImageUrl;
export const getImageUrl = fixImageUrl;
