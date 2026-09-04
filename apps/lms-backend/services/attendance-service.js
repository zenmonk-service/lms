const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/error");
const {
  attendanceLogRepository,
} = require("../repositories/attendance-log-repository");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const {
  AttendanceLogType,
} = require("../models/tenants/attendance/enum/attendance-log-type-enum");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const { fn, literal } = require("sequelize");
const { AttendanceReportType } = require("./enum/attendance-report-type.enum");
const Period = require("../lib/period");
const {
  validatingQueryParameters,
} = require("../lib/validate-query-parameters");
const { ExcelUtility } = require("../lib/excel-utility");
const { DownloadExcel } = require("./enum/download-excel.enum");
const { payrollRepository } = require("../repositories/payroll-repository");
const { CreateBulkAttendance } = require("./enum/create-bulk-attendance-enum");
const { validateBodyParameters } = require("../lib/validate-body-paramenters");
const { CreateRoute } = require("./enum/create-routes-enum");
const {
  LeaveRequestStatus,
} = require("../models/tenants/leave/enum/leave-request-status-enum");

exports.recordUserCheckIn = async (payload) => {
  const { user_uuid } = payload.params;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;

  const user = await userRepository.getUserById({ user_uuid }, false);
  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );
  if (!user.isActive()) throw new ForbiddenError("User is currently inactive.");

  const transaction = await transactionRepository.startTransaction();
  try {
    let attendance = await attendanceRepository.getAttendanceByCriteria({
      user_uuid,
      date: Period.getCurrentDate(),
    });

    if (attendance) {
      if (attendance.isOnLeaveOrHoliday())
        throw new BadRequestError(
          "Check_In not Allowed",
          "Contact your administrator",
        );
      if (attendance.isCheckedIn())
        throw new BadRequestError(
          "Already Checked In",
          "User has already checked in for today",
        );
      else {
        attendance.markCheckIn();
        await attendance.save();
        await attendanceLogRepository.create(
          {
            attendance_id: attendance.id,
            location,
            status: attendance.status,
            type: AttendanceLogType.ENUM.CHECK_IN,
            time: Period.getCurrentTime(),
            remarks: "User Check In",
          },
          { transaction },
        );
        await transactionRepository.commitTransaction(transaction);
        return attendance;
      }
    } else {
      attendance = await attendanceRepository.create(
        {
          user_id: attendanceRepository.getLiteralFrom(
            "user",
            user_uuid,
            "user_id",
          ),
          date: Period.getCurrentDate(),
          check_in: Period.getCurrentTime(),
          status: AttendanceStatus.ENUM.PRESENT,
        },
        { transaction },
      );
      await attendanceLogRepository.create(
        {
          attendance_id: attendance.id,
          location,
          type: AttendanceLogType.ENUM.CHECK_IN,
          status: AttendanceStatus.ENUM.PRESENT,
          time: Period.getCurrentTime(),
          remarks: "User CheckIn.",
        },
        { transaction },
      );
      await transactionRepository.commitTransaction(transaction);
      return attendance;
    }
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.recordUserCheckOut = async (payload) => {
  const { user_uuid } = payload.params;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById({ user_uuid }, false);
  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );

  if (!user.isActive()) throw new ForbiddenError("User is currently inactive.");

  const attendance = await attendanceRepository.getAttendanceByCriteria({
    user_uuid,
    date: new Date(),
  });

  if (!attendance)
    throw new NotFoundError(
      "Attendance not found",
      "User attendance for today not found",
    );

  if (!attendance.isCheckedOut())
    throw new BadRequestError(
      "Already Checked Out",
      "User has already checked out for today",
    );

  const transaction = await transactionRepository.startTransaction();

  try {
    await attendanceLogRepository.create(
      {
        attendance_id: attendance.id,
        location,
        status: attendance.status,
        type: AttendanceLogType.ENUM.CHECK_OUT,
        remarks: "User Check-out.",
        time: Period.getCurrentTime(),
      },
      { transaction },
    );

    attendance.markCheckOut();
    await attendance.save({ transaction });
    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getFilteredAttendance = async (payload) => {
  payload = await validatingQueryParameters({
    ...payload,
    repository: attendanceRepository,
  });
  const {
    user_uuid,
    user_name_search,
    date,
    date_range,
    status,
    page = 1,
    limit = 10,
  } = payload.query;
  return attendanceRepository.getFilteredAttendance(
    {
      user_uuid,
      user_name_search,
      date,
      date_range,
      status,
    },
    { page, limit },
  );
};

exports.getMissingAttendanceRecords = async (payload) => {
  const { period = Period.getCurrentPeriod() } = payload.query;
  const dateRange = Period.getPeriodDateRange(period);

  const dates =
    await attendanceRepository.getMissingAttendanceRecords(dateRange);
  console.log("dates: ", dates);
  return dates.map(({ date }) => date);
};

exports.createMissingAttendanceRecords = async (payload) => {
  const records = payload.body;

  const users = await userRepository.findAll({ is_active: true });

  const attendanceRecords = users.flatMap((user) =>
    records.map((record) => ({
      user_id: user.id,
      date: record.date,
      status: record.status,
    })),
  );

  return await attendanceRepository.bulkCreate(attendanceRecords, {
    ignoreDuplicates: true,
  });
};

exports.updateAttendance = async (payload) => {
  const { attendance_uuid } = payload.params;

  const attendance = await attendanceRepository.findOne({
    uuid: attendance_uuid,
  });

  if (!attendance) {
    throw new NotFoundError(
      "Attendance not found.",
      "Attendance with provided id not found.",
    );
  }

  const { check_in, check_out, status, remarks } = payload.body;

  const updatedRemarks = remarks ? [remarks] : [];

  if (check_in && check_in !== attendance.check_in) {
    updatedRemarks.push(
      `Check In changed from ${attendance.check_in || "-"} to ${check_in}`,
    );

    attendance.check_in = check_in;

    attendance.affected_hours = Period.getHoursDifference(
      attendance.check_in,
      attendance.check_out,
    );
  }

  if (check_out && check_out !== attendance.check_out) {
    updatedRemarks.push(
      `Check Out changed from ${attendance.check_out || "-"} to ${check_out}`,
    );

    attendance.check_out = check_out;

    attendance.affected_hours = Period.getHoursDifference(
      attendance.check_in,
      attendance.check_out,
    );
  }

  if (status && status !== attendance.status) {
    updatedRemarks.push(
      `Status changed from ${attendance.status} to ${status}`,
    );

    attendance.status = status;

    if (
      status === AttendanceStatus.ENUM.ABSENT ||
      status === AttendanceStatus.ENUM.ON_LEAVE
    ) {
      attendance.check_in = null;
      attendance.check_out = null;
      attendance.affected_hours = null;
    }
  }

  if (!updatedRemarks.length) {
    return attendance;
  }

  const transaction = await transactionRepository.startTransaction();

  try {
    if (
      [
        AttendanceStatus.ENUM.ON_LEAVE,
        AttendanceStatus.ENUM.HALF_DAY,
        AttendanceStatus.ENUM.SHORT_LEAVE,
      ].includes(status)
    ) {
      const { leaveRequestService } = require(".");

      const user = await userRepository.findOne({
        id: attendance.user_id,
      });

      if (!user) {
        throw new NotFoundError(
          "User not found.",
          "User associated with this attendance was not found.",
        );
      }

      const leavePayload = {
        body: {
          leave_type_uuid: payload.body.leave_type_uuid,
          start_date: attendance.date,
          end_date: attendance.date,
          managers: [payload.user.user_id],
          user_uuid: user.user_id,
          manager_uuid: payload.user.user_id,
          remark: remarks ?? "Admin has marked Leave for user.",
          status_changed_to: LeaveRequestStatus.ENUM.APPROVED,
          status,
          range: payload.body.range,
          type: payload.body.type,
        },
        headers: {
          org_uuid: payload.headers.org_uuid,
        },
      };

      await leaveRequestService.createAndApproveLeaveRequest(
        leavePayload,
        transaction,
      );
    }

    await attendance.save({ transaction });

    await attendanceLogRepository.create(
      {
        attendance_id: attendance.id,
        type: AttendanceLogType.ENUM.UPDATE,
        status: attendance.status,
        remarks: updatedRemarks.join(", "),
        action_by: payload.user.id,
      },
      { transaction },
    );

    const period = Period.convertPeriodFromDate(attendance.date);

    const userPayroll = await payrollRepository.findOne({
      period,
      user_id: attendance.user_id,
    });

    if (userPayroll) {
      const user = await userRepository.getUserPayroll({
        date_range: Period.getPeriodDateRange(period),
        user_id: attendance.user_id,
      });

      await payrollRepository.update(
        { id: userPayroll.id },
        {
          attendance_penalty: {
            [AttendanceStatus.ENUM.ABSENT]: user[0].absent_count,

            [AttendanceStatus.ENUM.LATE]: user[0].late_count,

            [AttendanceStatus.ENUM.EARLY_DEPARTURE]:
              user[0].early_departure_count,

            [AttendanceStatus.ENUM.MISSED_PUNCH]: user[0].missed_punch_count,
          },
        },
        undefined,
        transaction,
      );
    }

    await transactionRepository.commitTransaction(transaction);

    return attendance;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.recordAttendance = async (payload) => {
  const { user_uuid, date, check_in, check_out, status, remarks } =
    payload.body;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById({ user_uuid }, false);

  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );

  const transaction = await transactionRepository.startTransaction();
  try {
    const user_id = await userRepository.getLiteralFrom(
      "user",
      user_uuid,
      "user_id",
    );
    const attendance = await attendanceRepository.upsert(
      {
        user_id,
        date,
      },
      {
        user_id,
        date,
        check_in,
        check_out,
        status,
        affected_hours: Period.getHoursDifference(check_in, check_out),
      },
      transaction,
    );

    await attendanceLogRepository.create(
      {
        attendance_id: attendance[0].id,
        type: AttendanceLogType.ENUM.UPDATE,
        remarks: remarks ? remarks : "Attendance marked by Admin",
        status,
        action_by: payload.user.id,
        location,
      },
      { transaction },
    );

    await transactionRepository.commitTransaction(transaction);
    return attendance;
  } catch (error) {
    if (!transaction.finished) {
      await transactionRepository.rollbackTransaction(transaction);
    }
    throw error;
  }
};

exports.bulkCreateAttendances = async (payload) => {
  validateBodyParameters({
    payload,
    route: CreateRoute.ENUM.CREATE_BULK_ATTENDANCE,
  });
  const { date, attendances, type, status, remarks } = payload.body;
  console.log("attendances: ", attendances);

  if (type === CreateBulkAttendance.ENUM.EXCEL_UPLOAD) {
    const existingAttendances = await attendanceRepository.listAttendance({
      date,
    });

    const attendanceMap = new Map(
      existingAttendances.map((a) => [a.user_id, a]),
    );

    const attendancePayload = (
      await Promise.all(
        attendances.map(async (attendance) => {
          const { check_in, check_out, emp_code } = attendance;
          const user = await userRepository.getUserById({ emp_code });
          if (!user) {
            return;
          }
          const orgSetting = user.role.organization_setting;
          const flexibleTime = orgSetting.flexible_time || 0;
          const graceDuration = orgSetting.late_exception?.grace_duration || 0;

          const existingAttendance = attendanceMap.get(user.id);

          const hasShortLeave = existingAttendance?.attendance_log.some(
            (al) => al.status === AttendanceStatus.ENUM.SHORT_LEAVE,
          );
          const hasHalfDay = existingAttendance?.attendance_log.some(
            (al) => al.status === AttendanceStatus.ENUM.HALF_DAY,
          );
          const hasOnLeave = existingAttendance?.attendance_log.some(
            (al) => al.status === AttendanceStatus.ENUM.ON_LEAVE,
          );

          const tolerance = hasShortLeave ? 0.25 : hasHalfDay ? 0.5 : 0;

          const startMin = Period.convertTimeToMinutes(orgSetting.start_time);
          const endMin = Period.convertTimeToMinutes(orgSetting.end_time);
          const officeMinutes = endMin - startMin;

          let status = AttendanceStatus.ENUM.PRESENT;

          const tryUseLateException = async () => {
            if (user.late_exception_balance > 0) {
              user.useLateException();
              await user.save();
              return true;
            }
            return false;
          };

          if (!check_in && !check_out) {
            return hasOnLeave
              ? null
              : {
                  ...attendance,
                  date: date,
                  user_id: user.id,
                  status: AttendanceStatus.ENUM.ABSENT,
                };
          }

          if ((check_in && !check_out) || (!check_in && check_out)) {
            if (Period.comparePeriods(date, Period.getCurrentDate()) === -1) {
              status = AttendanceStatus.ENUM.MISSED_PUNCH;
            }
            return { ...attendance, user_id: user.id, status, date: date };
          }

          const checkInMin = Period.convertTimeToMinutes(check_in);
          const checkOutMin = Period.convertTimeToMinutes(check_out);
          const workingMinutes = checkOutMin - checkInMin;

          if (orgSetting.start_time && checkInMin > startMin) {
            const lateMinutes = checkInMin - startMin;
            const allowedLateMinutes = flexibleTime + officeMinutes * tolerance;

            if (lateMinutes > allowedLateMinutes) {
              const withinGraceWindow =
                lateMinutes <= allowedLateMinutes + graceDuration;

              const excused = withinGraceWindow && (await tryUseLateException());
              if (!excused) {
                status = AttendanceStatus.ENUM.LATE;
              }
            }
          }

          if (
            status === AttendanceStatus.ENUM.PRESENT &&
            workingMinutes < officeMinutes
          ) {
            const shortfallMinutes = officeMinutes - workingMinutes;
            const allowedShortfallMinutes = officeMinutes * tolerance;

            if (shortfallMinutes > allowedShortfallMinutes) {
              const withinGraceWindow =
                shortfallMinutes <= allowedShortfallMinutes + graceDuration;

              const excused = withinGraceWindow && (await tryUseLateException());
              if (!excused) {
                status = AttendanceStatus.ENUM.EARLY_DEPARTURE;
              }
            }
          }

          return {
            user_id: user.id,
            date,
            check_in,
            check_out,
            status,
            affected_hours: Period.getHoursDifference(check_in, check_out),
          };
        }),
      )
    )
      .filter(Boolean)
      .filter((a) => a.user_id);

    console.log("attendancePayload: ", attendancePayload);
    const response =
      await attendanceRepository.bulkCreateAttendances(attendancePayload);

    const attendanceLogs = response.map((attendance) => {
      return {
        attendance_id: attendance.id,
        type: AttendanceLogType.ENUM.BULK_CREATE,
        status: attendance.status,
        remarks: remarks ? remarks : "Attendance marked using excel.",
        action_by: payload.user.id,
      };
    });

    await attendanceLogRepository.bulkCreate(attendanceLogs);
  } else {
    const users = await userRepository.findAll({
      is_active: true,
    });

    const attendancePayload = users.map((user) => ({
      user_id: user.id,
      status,
      date,
      attendance_log: [
        {
          remarks: remarks ? remarks : "Attendance marked by admin.",
          action_by: payload.user.id,
          type: AttendanceLogType.ENUM.BULK_CREATE,
          status,
        },
      ],
    }));
    await attendanceRepository.bulkCreateAttendances(attendancePayload);
  }
};
exports.getAttendanceByCriteria = async (payload) => {
  const { user_uuid } = payload.params;
  return attendanceRepository.getAttendanceByCriteria({
    user_uuid,
    date: new Date(),
  });
};

exports.listAttendanceReport = async (payload) => {
  const { type } = payload.query;

  switch (type) {
    case AttendanceReportType.ENUM.USER_ATTENDANCE:
      return await this.listUserAttendance(payload);

    case AttendanceReportType.ENUM.DAILY_ATTENDANCE:
      return await this.getDailyAttendanceCount(payload);

    case AttendanceReportType.ENUM.MONTHLY_ATTENDANCE:
      return await this.getMonthlyAttendanceCount(payload);

    default: {
      const userAttendance = await this.listUserAttendance(payload);
      const dailyAttendance = await this.getDailyAttendanceCount(payload);
      const monthlyAttendance = await this.getMonthlyAttendanceCount(payload);

      return {
        ...userAttendance,
        ...dailyAttendance,
        ...monthlyAttendance,
      };
    }
  }
};

exports.listUserAttendance = async (payload) => {
  let { month, date, status, search, page, limit } = payload.query;

  if (!month) {
    month = Period.getCurrentPeriod();
  }

  let { start_date: startDate, end_date: endDate } =
    Period.getPeriodDateRange(month);

  if (date) {
    startDate = date;
    endDate = date;
  }

  const response = await userRepository.listUserAttendanceReport(
    { startDate, endDate, month, status },
    { search, page, limit },
  );
  return { user_attendance_report: response };
};

exports.getDailyAttendanceCount = async (payload) => {
  let { date } = payload.query;
  console.log("date: ", date);

  if (!date) {
    date = Period.getCurrentDate();
  }

  const response = await attendanceRepository.findOne(
    {
      date,
    },
    [],
    true,
    [
      [
        fn(
          "COUNT",
          literal(
            `CASE WHEN status = '${AttendanceStatus.ENUM.PRESENT}' THEN 1 END`,
          ),
        ),
        "present_count",
      ],
      [
        fn(
          "COUNT",
          literal(
            `CASE WHEN status = '${AttendanceStatus.ENUM.ABSENT}' THEN 1 END`,
          ),
        ),
        "absent_count",
      ],
      [
        fn(
          "COUNT",
          literal(
            `CASE WHEN status = '${AttendanceStatus.ENUM.ON_LEAVE}' THEN 1 END`,
          ),
        ),
        "on_leave_count",
      ],
      [
        fn(
          "COUNT",
          literal(
            `CASE WHEN status = '${AttendanceStatus.ENUM.LATE}' THEN 1 END`,
          ),
        ),
        "late_count",
      ],
    ],
  );

  return {
    daily_attendance_report: response,
  };
};

exports.getMonthlyAttendanceCount = async (payload) => {
  let { start_month, end_month } = payload.query;

  let startDate, endDate;

  if (start_month && end_month) {
    const [startMonth, startYear] = start_month.split("-");
    const [endMonth, endYear] = end_month.split("-");

    startDate = new Date(startYear, startMonth - 1, 1);

    endDate = new Date(endYear, endMonth, 0);
  } else {
    const today = new Date();

    startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }
  const response = await attendanceRepository.getMonthlyAttendanceReport(
    startDate,
    endDate,
  );
  return { monthly_attendance_report: response };
};

exports.downloadAttendanceReport = async (payload) => {
  let { type, date, date_range, status, search } = payload.query;
  let data;

  switch (type) {
    case DownloadExcel.ENUM.DAILY_ATTENDANCE:
      data = await userRepository.listUserByCriteria({
        date,
        date_range,
        status,
        search,
      });
      return {
        filename: `Attendance-${date}.xlsx`,
        buffer: await ExcelUtility.writeFile(type, data),
      };

    case DownloadExcel.ENUM.MONTHLY_ATTENDANCE:
      data = await userRepository.listUserByCriteria({
        date,
        date_range,
        status,
        search,
      });
      return {
        filename: `Attendance-${date_range.start_date}_to_${date_range.end_date}.xlsx`,
        buffer: await ExcelUtility.writeFile(type, data),
      };

    case DownloadExcel.ENUM.DAILY_ATTENDANCE_ANALYTICS:
      if (!date) {
        date = Period.getCurrentDate();
      }
      data = await this.getDailyAttendanceCount(payload);
      return {
        filename: `Attendance-Analytics-${date}.xlsx`,
        buffer: await ExcelUtility.writeFile(
          type,
          data.daily_attendance_report,
        ),
      };

    case DownloadExcel.ENUM.MONTHLY_ATTENDANCE_ANALYTICS:
      data = await this.getMonthlyAttendanceCount(payload);
      return {
        filename: "Monthly-Attendance-Analytics.xlsx",
        buffer: await ExcelUtility.writeFile(
          type,
          data.monthly_attendance_report,
        ),
      };

    default:
      throw new Error(`Unsupported download type: ${type}`);
  }
};
