export const formatQueryDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatPriority = (priority?: string | null) => priority ?? "Medium";
export const formatStatus = (status?: string | null) => status ?? "OPEN";
export const formatModule = (module?: string | null) => module ?? "Other";
