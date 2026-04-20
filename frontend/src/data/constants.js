export const CATEGORIES = ["All", "Indian Ethnic Wear", "Indian Premium Western Wear"];

export const SHIPPING_FREE_THRESHOLD = 2999;
export const SHIPPING_FEE = 99;

export const getShippingCharge = (subtotal) => (subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE);
