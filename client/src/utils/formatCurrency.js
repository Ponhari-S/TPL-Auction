export const formatPrice = (val, includeSymbol = true) => {
  if (val === null || val === undefined || isNaN(val)) return includeSymbol ? '₹0' : '0';
  const num = Number(val);
  const prefix = includeSymbol ? '₹' : '';

  if (num === 0) return `${prefix}0`;

  if (num >= 1000000) {
    const cr = num / 10000000;
    const formatted = parseFloat(cr.toFixed(2));
    return `${prefix}${formatted} Cr`;
  }

  if (num >= 100000) {
    const l = num / 100000;
    const formatted = parseFloat(l.toFixed(2));
    return `${prefix}${formatted} L`;
  }

  if (num >= 1000) {
    const k = num / 1000;
    const formatted = parseFloat(k.toFixed(1));
    return `${prefix}${formatted} K`;
  }

  return `${prefix}${num.toLocaleString('en-IN')}`;
};

export default formatPrice;
