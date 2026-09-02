import { Attendance } from "@/features/attendances/attendances.type";
import dayjs from "dayjs";

export const getAttendanceTooltip = (attendance: Attendance) => {
  const date = dayjs(attendance.date).format("DD MMM YYYY (ddd)");

  switch (attendance.status) {
    case "present":
      return (
        <>
          <p className="font-semibold">Present</p>
          <p>Date: {date}</p>
          <p>Check In: {attendance.check_in || "-"}</p>
          <p>Check Out: {attendance.check_out || "-"}</p>
        </>
      );

    case "late":
      return (
        <>
          <p className="font-semibold">Late Arrival</p>
          <p>Date: {date}</p>
          <p>Check In: {attendance.check_in || "-"}</p>
          <p>Check Out: {attendance.check_out || "-"}</p>
        </>
      );

    case "early_departure":
      return (
        <>
          <p className="font-semibold">Early Departure</p>
          <p>Date: {date}</p>
          <p>Check In: {attendance.check_in|| "-"}</p>
          <p>Check Out: {attendance.check_out || "-"}</p>
        </>
      );

    case "on_leave":
      return (
        <>
          <p className="font-semibold">Leave</p>
          <p>Date: {date}</p>
        </>
      );

    case "absent":
      return (
        <>
          <p className="font-semibold">Absent</p>
          <p>Date: {date}</p>
        </>
      );

    case "holiday":
      return (
        <>
          <p className="font-semibold">Holiday</p>
          <p>Date: {date}</p>
        </>
      );

    case "week_off":
      return (
        <>
          <p className="font-semibold">Week Off</p>
          <p>Date: {date}</p>
        </>
      );
    case "half_day":
      return (
        <>
          <p className="font-semibold">Half Day</p>
          <p>Date: {date}</p>
          <p>Check In: {attendance.check_in || "-"}</p>
          <p>Check Out: {attendance.check_out || "-"}</p>
        </>
      );
    case "missed_punch":
      return (
        <>
          <p className="font-semibold">Miss Punch</p>
          <p>Date: {date}</p>
          <p>Check In: {attendance.check_in || "-"}</p>
          <p>Check Out: {attendance.check_out || "-"}</p>
        </>
      );
    default:
      return <p>{date}</p>;
  }
};
