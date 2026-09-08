/** Formats a local Date as `yyyy-mm-dd` (no time component). */
const toDateOnly = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export const getDateRange = (type: "week" | "month" | "year") => {
  const now = new Date();

  let startDate: Date;
  let endDate: Date;

  switch (type) {
    case "week":
      // Week is always Sunday -> Saturday. getDay() is 0 for Sunday.
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;

    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;

    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
  }

  return {
    start_date: toDateOnly(startDate),
    end_date: toDateOnly(endDate),
  };
};
