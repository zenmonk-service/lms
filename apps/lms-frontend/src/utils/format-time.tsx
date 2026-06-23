 export  function formatAttendanceTime(value?: string) {
    if (!value) return "-- : --";

    const date = value.includes("T")
      ? new Date(value)
      : new Date(`1970-01-01T${value}Z`);

    if (Number.isNaN(date.getTime())) return "-- : --";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }