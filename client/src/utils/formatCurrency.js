/**
 * Formats monetary amounts into Indian cricket auction style:
 * e.g., 10000000 -> "₹1 Cr", 5000000 -> "₹0.5 Cr", 200000 -> "₹2 L"
 */
export const formatPrice = (val, includeSymbol = true) => {
  if (val === null || val === undefined || isNaN(val)) return includeSymbol ? '₹0' : '0';
  const num = Number(val);
  const prefix = includeSymbol ? '₹' : '';

  if (num === 0) return `${prefix}0`;

  // Values >= 10 Lakhs (1,000,000) are represented in Crores (Cr)
  // e.g. 10,000,000 -> 1 Cr, 5,000,000 -> 0.5 Cr, 15,000,000 -> 1.5 Cr
  if (num >= 1000000) {
    const cr = num / 10000000;
    const formatted = parseFloat(cr.toFixed(2));
    return `${prefix}${formatted} Cr`;
  }

  // Values between 1 Lakh (100,000) and 10 Lakhs (1,000,000) in Lakhs (L)
  // e.g. 500,000 -> 5 L, 200,000 -> 2 L
  if (num >= 100000) {
    const l = num / 100000;
    const formatted = parseFloat(l.toFixed(2));
    return `${prefix}${formatted} L`;
  }

  // Values between 1,000 and 100,000 in Thousands (K)
  // e.g. 50,000 -> 50 K
  if (num >= 1000) {
    const k = num / 1000;
    const formatted = parseFloat(k.toFixed(1));
    return `${prefix}${formatted} K`;
  }

  return `${prefix}${num.toLocaleString('en-IN')}`;
};

export default formatPrice;
