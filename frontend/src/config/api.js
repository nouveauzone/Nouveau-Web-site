const API_URL = process.env.REACT_APP_API_URL;

export const getProducts = async () => {
  const res = await fetch(`${API_URL}/api/products?limit=50`);
  return res.json();
};
