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
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");
const { validateBodyParameters } = require("../lib/validate-body-paramenters");
const {
  validatingQueryParameters,
} = require("../lib/validate-query-parameters");
const { ExcelUtility } = require("../lib/excel-utility");
const { DownloadExcel } = require("./enum/download-excel.enum");
const { CreateRoute } = require("./enum/create-routes-enum");

exports.recordUserCheckIn = async (payload) => {
  const { user_uuid } = payload.params;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById(user_uuid);
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
      date: new Date(),
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
            type: AttendanceLogType.ENUM.CHECK_IN,
            time: Period.getCurrentTime(),
          },
          { transaction },
        );
        await transactionRepository.commitTransaction(transaction);
        return attendance;
      }
    } else {
      attendance = await attendanceRepository.createAttendance(
        user_uuid,
        transaction,
      );
      await attendanceLogRepository.create(
        {
          attendance_id: attendance[0].id,
          location,
          type: AttendanceLogType.ENUM.CHECK_IN,
          time: Period.getCurrentTime(),
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
  const user = await userRepository.getUserById(user_uuid);
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
        type: AttendanceLogType.ENUM.CHECK_OUT,
        time: Period.getCurrentTime(),
      },
      { transaction },
    );

    attendance.markCheckOut();
    await transactionRepository.commitTransaction(transaction);
    return attendance.save();
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
  const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } =
    payload.query;

  const dates = await attendanceRepository.getMissingAttendanceRecords(
    month,
    year,
  );
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

  const { check_in, check_out, status } = payload.body;
  const remarks = [];

  if (check_in && check_in !== attendance.check_in) {
    remarks.push(
      `Check In changed from ${attendance.check_in || "-"} to ${check_in}`,
    );
    attendance.check_in = check_in;
  }

  if (check_out && check_out !== attendance.check_out) {
    remarks.push(
      `Check Out changed from ${attendance.check_out || "-"} to ${check_out}`,
    );
    attendance.check_out = check_out;
  }

  if (status && status !== attendance.status) {
    remarks.push(`Status changed from ${attendance.status} to ${status}`);
    attendance.status = status;
  }

  if (!remarks.length) {
    return attendance;
  }

  await attendance.save();
  await attendanceLogRepository.create({
    attendance_id: attendance.id,
    type: AttendanceLogType.ENUM.UPDATE,
    remarks: remarks.join(", "),
    action_by: payload.user.id,
  });
  return attendance;
};

exports.recordAttendance = async (payload) => {
  const { user_uuid, date, check_in, check_out, status } = payload.body;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById(user_uuid);

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
      },
      transaction,
    );

    await attendanceLogRepository.create(
      {
        attendance_id: attendance[0].id,
        type: AttendanceLogType.ENUM.UPDATE,
        remarks: "Attendance marked by Admin",
        action_by: payload.user.id,
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

exports.bulkCreateAttendanceWithExcel = async (payload) => {
  const { date, attendances } = payload.body;
  console.log("attendances: ", attendances);

  const orgSetting = await organizationSettingRepository.findOne();

  const existingAttendances = await attendanceRepository.findAll({
    date: date,
  });

  const attendanceMap = new Map(existingAttendances.map((a) => [a.user_id, a]));

  const attendancePayload = (
    await Promise.all(
      attendances.map(async (attendance) => {
        const { check_in, check_out, emp_code } = attendance;

        const userIdLiteral = await attendanceRepository.getLiteralFrom(
          "user",
          emp_code,
          "emp_code",
        );
        const userId = userIdLiteral.val.match(/'([^']+)'/)[1];

        const existingAttendance = attendanceMap.get(userId);
        const hasShortLeave =
          existingAttendance?.status === AttendanceStatus.ENUM.SHORT_LEAVE;
        const hasHalfDay =
          existingAttendance?.status === AttendanceStatus.ENUM.HALF_DAY;
        const hasOnLeave =
          existingAttendance?.status === AttendanceStatus.ENUM.ON_LEAVE;

        const tolerance = hasShortLeave ? 0.25 : hasHalfDay ? 0.5 : 0;

        const officeMinutes =
          Period.convertTimeToMinutes(orgSetting.end_time) -
          Period.convertTimeToMinutes(orgSetting.start_time);

        let status = AttendanceStatus.ENUM.PRESENT;

        if (!check_in && !check_out) {
          return hasOnLeave
            ? null
            : {
                ...attendance,
                date: date,
                user_id: userIdLiteral,
                status: AttendanceStatus.ENUM.ABSENT,
              };
        }

        if ((check_in && !check_out) || (!check_in && check_out)) {
          if (Period.comparePeriods(date, Period.getCurrentPeriod()) === -1) {
            status = AttendanceStatus.ENUM.MISSED_PUNCH;
          }
          return { ...attendance, user_id: userIdLiteral, status };
        }

        const checkInMin = Period.convertTimeToMinutes(check_in);
        const checkOutMin = Period.convertTimeToMinutes(check_out);
        const workingMinutes = checkOutMin - checkInMin;

        if (orgSetting.start_time && check_in > orgSetting.start_time) {
          const lateMinutes =
            checkInMin - Period.convertTimeToMinutes(orgSetting.start_time);
          if (lateMinutes > officeMinutes * tolerance) {
            status = AttendanceStatus.ENUM.LATE;
          }
        }

        if (orgSetting.end_time && check_out < orgSetting.end_time) {
          const earlyMinutes =
            Period.convertTimeToMinutes(orgSetting.end_time) - checkOutMin;
          if (earlyMinutes > officeMinutes * tolerance) {
            status = AttendanceStatus.ENUM.EARLY_DEPARTURE;
          }
        }

        if (
          status === AttendanceStatus.ENUM.PRESENT &&
          workingMinutes < officeMinutes
        ) {
          if (officeMinutes - workingMinutes > officeMinutes * tolerance) {
            status = AttendanceStatus.ENUM.EARLY_DEPARTURE;
          }
        }

        return {
          user_id: userIdLiteral,
          date,
          check_in,
          check_out,
          status,
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
      remarks: "Attendance marked using excel.",
      action_by: payload.user.id,
    };
  });

  await attendanceLogRepository.bulkCreate(attendanceLogs);
};

// exports.bulkCreateAttendances = async (payload) => {
//   payload = await validateBodyParameters({
//     payload,
//     route: CreateRoute.ENUM.CREATE_ATTENDANCE,
//   });
//   const location =
//     payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;

//   const attendanceRecordsPayload = await Promise.all(
//     payload.body
//       .filter(async (attendance) => {
//         const user = await userRepository.getUserById(attendance.user_uuid);
//         return user && user.isActive();
//       })
//       .map(async (attendance) => {
//         const record = {
//           user_id: attendanceRepository.getLiteralFrom(
//             "user",
//             attendance.user_uuid,
//             "user_id",
//           ),
//           check_in: attendance.check_in,
//           check_out: attendance.check_out,
//           date: attendance.date,
//           status: attendance.status,
//           affected_hours: attendance.affected_hours,
//           attendance_log: [],
//         };

//         if (attendance.check_in) {
//           record.attendance_log.push({
//             time: attendance.check_in,
//             type: AttendanceLogType.ENUM.CHECK_IN,
//             location,
//           });
//         }

//         if (attendance.check_out) {
//           record.attendance_log.push({
//             time: attendance.check_out,
//             type: AttendanceLogType.ENUM.CHECK_OUT,
//             location,
//           });
//         }

//         if (attendance.attendance_log?.length) {
//           record.attendance_log = attendance.attendance_log;
//         }

//         return record;
//       }),
//   );

//   return attendanceRepository.bulkCreateAttendances(attendanceRecordsPayload);
// };

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
    month = new Date().toISOString().slice(0, 7);
  }

  let startDate = `${month}-01`;

  let endDate = new Date(
    Number(month.split("-")[0]),
    Number(month.split("-")[1]),
    0,
  )
    .toISOString()
    .split("T")[0];

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
      data = await userRepository.listUserAttendance({
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
      data = await userRepository.listUserAttendance({
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
