export const formatCurrency = (amount, currency = "ETB") => {
  const numeric = Number(amount ?? 0);
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isNaN(numeric) ? 0 : numeric);
};

export default formatCurrency;
