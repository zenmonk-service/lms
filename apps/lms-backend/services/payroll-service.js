const { Op } = require("sequelize");
const { BadRequestError } = require("../middleware/error");
const { ExcelUtility } = require("../lib/excel-utility");
const Period = require("../lib/period");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const { Paginator } = require("../repositories/common/pagination");
const { payrollRepository } = require("../repositories/payroll-repository");
const { userRepository } = require("../repositories/user-repository");
const { DownloadExcel } = require("./enum/download-excel.enum");
const {
  AttendanceLogType,
} = require("../models/tenants/attendance/enum/attendance-log-type-enum");

exports.getFilteredPayrolls = async (payload) => {
  const { period, page = 1, limit = 10, search } = payload.query;

  const {
    offset,
    limit: pageLimit,
    page: currentPage,
  } = new Paginator(page, limit);

  return await payrollRepository.getFilteredPayrolls(
    period,
    offset,
    currentPage,
    pageLimit,
    search,
  );
};

exports.updatePayroll = async (payload) => {
  const { user_id, ...rest } = payload.body;
  let criteria = {
    user_id: {
      [Op.eq]: payrollRepository.getLiteralFrom("user", user_id, "user_id"),
    },
  };

  await payrollRepository.update(criteria, rest);
};

exports.generatePayroll = async (payload) => {
  const { period = Period.getCurrentPeriod() } = payload.body;
  const dateRange = Period.getPeriodDateRange(period);
  const missingOrgWide =
    await attendanceRepository.getMissingAttendanceRecords(dateRange);
  console.log("missingOrgWide: ", missingOrgWide);
  if (missingOrgWide.length > 0) {
    throw new BadRequestError(
      "Please ensure all employees have complete attendance records before generating payroll.",
    );
  }

  const missingPerUser =
    await attendanceRepository.getPerUserMissingAttendanceRecords(dateRange);
  console.log("missingPerUser: ", missingPerUser);
  if (missingPerUser.length > 0) {
    const absentRecords = missingPerUser.map(({ user_id, date }) => ({
      user_id,
      date,
      status: AttendanceStatus.ENUM.ABSENT,
      attendance_log: [
        {
          remarks: "User marked absent by system.",
          status: AttendanceStatus.ENUM.ABSENT,
          type: AttendanceLogType.ENUM.SYSTEM
        },
      ],
    }));
    await attendanceRepository.bulkCreateAttendances(absentRecords);
  }

  const users = await userRepository.getUserPayroll({
    date_range: dateRange,
  });
  console.log("users: ", users);
  const payrolls = users.map((userInstance) => {
    const user = userInstance.get({ plain: true });

    return {
      user_id: user.id,
      attendance_penalty: {
        [AttendanceStatus.ENUM.ABSENT]: user.absent_count,
        [AttendanceStatus.ENUM.LATE]: user.late_count,
        [AttendanceStatus.ENUM.EARLY_DEPARTURE]: user.early_departure_count,
        [AttendanceStatus.ENUM.MISSED_PUNCH]: user.missed_punch_count,
      },
      leave_balance_deficit: user.leave_balances.map((lb) => ({
        leaves_allocated: lb.leaves_allocated,
        final_balance: lb.final_balance,
        balance: lb.balance,
        name: lb.leave_type.name,
        code: lb.leave_type.code,
      })),
      period,
    };
  });

  console.log("payrolls: ", payrolls);
  return await payrollRepository.bulkCreatePayRoll(payrolls);
};

exports.downloadMonthlyPayroll = async (payload) => {
  let { period = Period.getCurrentPeriod() } = payload.query;

  const data = await userRepository.listUserDownloadData({ period });

  return {
    filename: `Monthly-PayRoll-${period}.xlsx`,
    buffer: await ExcelUtility.writeFile(
      DownloadExcel.ENUM.MONTHLY_PAYROLL,
      data,
    ),
  };
};
