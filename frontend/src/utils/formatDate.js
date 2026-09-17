export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default formatDate;
