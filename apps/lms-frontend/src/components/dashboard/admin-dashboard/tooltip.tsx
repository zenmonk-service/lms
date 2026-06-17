import { changeUTCtoLocalTime } from "@/components/attendance/shared/components/table";
import { Attendance } from "@/features/attendances/attendances.type";
import dayjs from "dayjs";
import { log } from "util";

export const getAttendanceTooltip = (attendance: Attendance) => {
  const date = dayjs(attendance.date).format("DD MMM YYYY (ddd)");

  switch (attendance.status) {
    case "present":
      return (
        <>
          <p className="font-semibold">Present</p>
          <p>Date: {date}</p>
          <p>Check In: {changeUTCtoLocalTime(attendance.check_in) || "-"}</p>
          <p>Check Out: {changeUTCtoLocalTime(attendance.check_out) || "-"}</p>
        </>
      );

    case "late":
      return (
        <>
          <p className="font-semibold">Late Arrival</p>
          <p>Date: {date}</p>
          <p>Check In: {changeUTCtoLocalTime(attendance.check_in) || "-"}</p>
          <p>Check Out: {changeUTCtoLocalTime(attendance.check_out) || "-"}</p>
        </>
      );

    case "early_departure":
      return (
        <>
          <p className="font-semibold">Early Departure</p>
          <p>Date: {date}</p>
          <p>Check In: {changeUTCtoLocalTime(attendance.check_in) || "-"}</p>
          <p>Check Out: {changeUTCtoLocalTime(attendance.check_out) || "-"}</p>
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
    case "on_duty":
      return (
        <>
          <p className="font-semibold">On Duty</p>
          <p>Date: {date}</p>
          <p>Check In: {changeUTCtoLocalTime(attendance.check_in) || "-"}</p>
          <p>Check Out: {changeUTCtoLocalTime(attendance.check_out) || "-"}</p>
        </>
      );
    default:
      return <p>{date}</p>;
  }
};
