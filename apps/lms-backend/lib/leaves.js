const moment = require("moment-timezone");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const Period = require("./period");
const { TimePeriod } = require("../models/common/time-period-enum");

const DEFAULT_TZ = process.env.TIMEZONE;

const toTzMoment = (value) => {
  if (moment.isMoment(value)) {
    return value.clone().tz(DEFAULT_TZ);
  }
  return moment(value).tz(DEFAULT_TZ);
};

function findSandwichLeavesBefore(
  startDate,
  approvedLeaves,
  upperLimitStartDates,
  sandwichLeaves,
) {
  if (
    approvedLeaves.some((obj) => obj.type === "start") &&
    upperLimitStartDates.length > 0
  ) {
    let leaveObj = approvedLeaves.find((obj) => obj.type === "start");
    let leaveDate = leaveObj ? toTzMoment(leaveObj.date) : null;

    if (leaveDate) {
      let upperLimitStartDate = leaveDate.clone().add(1, "day");
      const startMoment = toTzMoment(startDate);

      while (upperLimitStartDate.isBefore(startMoment, "day")) {
        let found = upperLimitStartDates.find((obj) => {
          let objDate = toTzMoment(obj.date);
          return objDate.isSame(upperLimitStartDate, "day");
        });

        if (found) {
          sandwichLeaves.push(found);
        }
        upperLimitStartDate.add(1, "day");
      }
    }
  }
}

function findSandwichLeavesAfter(
  endDate,
  approvedLeaves,
  lowerLimitEndDates,
  sandwichLeaves,
) {
  if (
    approvedLeaves.some((obj) => obj.type === "end") &&
    lowerLimitEndDates.length > 0
  ) {
    let leaveObj = approvedLeaves.find((obj) => obj.type === "end");
    let leaveDate = leaveObj ? toTzMoment(leaveObj.date) : null;

    if (leaveDate) {
      let lowerLimitEndDate = leaveDate.clone().subtract(1, "day");
      const endMoment = toTzMoment(endDate);

      while (lowerLimitEndDate.isAfter(endMoment, "day")) {
        let found = lowerLimitEndDates.find((obj) => {
          let objDate = toTzMoment(obj.date);
          return objDate.isSame(lowerLimitEndDate, "day");
        });

        if (found) {
          sandwichLeaves.push(found);
        }
        lowerLimitEndDate.subtract(1, "day");
      }
    }
  }
}

function clubbingApprovedLeaves(
  upperLimitStartDates,
  lowerLimitEndDates,
  leaveRequest,
  upperLimitExist,
  lowerLimitExist,
  attendancePayload,
  transaction,
) {
  if (upperLimitExist && lowerLimitExist) {
    leaveRequest.effective_days +=
      upperLimitStartDates.length + lowerLimitEndDates.length;

    attendancePayload.push(
      ...upperLimitStartDates.map((attendance) => {
        const { id, uuid, attendance_log, ...plainAttendance } = attendance.get(
          { plain: true },
        );
        return {
          ...plainAttendance,
          leave_type_id: leaveRequest.leave_type_id,
          status: AttendanceStatus.ENUM.ON_LEAVE,
        };
      }),
      ...lowerLimitEndDates.map((attendance) => {
        const { id, uuid, attendance_log, ...plainAttendance } = attendance.get(
          { plain: true },
        );
        return {
          ...plainAttendance,
          leave_type_id: leaveRequest.leave_type_id,
          status: AttendanceStatus.ENUM.ON_LEAVE,
        };
      }),
    );
  }
}

function sandwichApprovedLeaves(
  startDate,
  endDate,
  leaveRequest,
  upperLimitStartDates,
  lowerLimitEndDates,
  approvedLeaves,
  attendancePayload,
  transaction,
) {
  let OutsideSandwichDates = [];

  findSandwichLeavesBefore(
    startDate,
    approvedLeaves,
    upperLimitStartDates,
    OutsideSandwichDates,
  );
  findSandwichLeavesAfter(
    endDate,
    approvedLeaves,
    lowerLimitEndDates,
    OutsideSandwichDates,
  );

  leaveRequest.effective_days += OutsideSandwichDates.length;
  attendancePayload.push(
    ...OutsideSandwichDates.map((attendance) => {
      const { id, uuid, attendance_log, ...plainAttendance } = attendance.get({
        plain: true,
      });
      return {
        ...plainAttendance,
        leave_type_id: leaveRequest.leave_type_id,
        status: AttendanceStatus.ENUM.ON_LEAVE,
      };
    }),
  );
}

function allocateLeaveBalance(users, leaveType) {
  const currentPeriod = Period.getCurrentPeriod();
  const now = Period.toMoment(new Date());
  const isEndOfMonth = leaveType.accrual?.applicable_on === "end_of_month";
  const isYearly = leaveType.accrual?.period === TimePeriod.ENUM.YEARLY;
  const leaveCount = leaveType.getLeaveCount() ?? 0;
  const monthsRemainingInYear = 12 - now.month();

  const proratedYearlyCount = isYearly
  ? Math.round((leaveCount / 12) * monthsRemainingInYear)
  : leaveCount;
  
  return users.map((user) => {
    const orgSettings = user.role.organization_setting;
    const cutOff = orgSettings?.leave_allocation_policy?.cut_off;

    const isPastCutOff = cutOff ? now.isAfter(moment(cutOff)) : false;
    const cutOffDeduction = isPastCutOff ? 1 : 0;

    const baseCount = isEndOfMonth ? 0 : proratedYearlyCount;
    const finalCount = baseCount - cutOffDeduction;

    return {
      user_id: user.id,
      leave_type_id: leaveType.id,
      balance: finalCount,
      leaves_allocated: finalCount,
      period: currentPeriod,
    };
  });
}

module.exports = {
  findSandwichLeavesAfter,
  findSandwichLeavesBefore,
  clubbingApprovedLeaves,
  sandwichApprovedLeaves,
  allocateLeaveBalance,
};
