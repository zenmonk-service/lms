const { Op } = require("sequelize");
const { BadRequestError, NotFoundError } = require("../middleware/error");
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

exports.getFilteredPayrolls = async (payload) => {
  const {
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
    page = 1,
    limit = 10,
    search = "",
  } = payload.query;

  const {
    offset,
    limit: pageLimit,
    page: currentPage,
  } = new Paginator(page, limit);

  const period = `${year}-${month.toString().padStart(2, "0")}`;

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

async function generateSinglePayroll(payroll_id) {
  const payroll = await payrollRepository.findOne({
    id: { [Op.eq]: payroll_id },
  });

  if (!payroll) throw new NotFoundError("Payroll not found");

  const [year, month] = payroll.period.split("-").map(Number);

  const userData = await userRepository.getUserPayrollData(
    payroll.user_id,
    month,
    year,
  );
  
  const payload = {
    attendance_penalty: {
      [AttendanceStatus.ENUM.ABSENT]: userData.getDataValue("absent_count"),
      [AttendanceStatus.ENUM.LATE]: userData.getDataValue("late_count"),
      [AttendanceStatus.ENUM.EARLY_DEPARTURE]: userData.getDataValue("early_departure_count"),
    },
    leave_balance_deficit: userData.leave_balances.length,
  };
  
  return await payrollRepository.update(
    { id: { [Op.eq]: payroll_id } },
    payload,
  );
}

async function generateMonthlyPayroll(month, year) {
  const missingOrgWide = await attendanceRepository.getMissingAttendanceRecords(
    month,
    year,
  );
  if (missingOrgWide.length > 0) {
    throw new BadRequestError(
      "Please ensure all employees have complete attendance records before generating payroll.",
    );
  }

  const missingPerUser =
    await attendanceRepository.getPerUserMissingAttendanceRecords(month, year);
  if (missingPerUser.length > 0) {
    const absentRecords = missingPerUser.map(({ user_id, date }) => ({
      user_id,
      date,
      status: AttendanceStatus.ENUM.ABSENT,
    }));
    await attendanceRepository.bulkCreateAttendances(absentRecords);
  }

  const users = await userRepository.getUsersPayrollData(month, year);

  const data = users.map((user) => ({
    user_id: user.id,
    attendance_penalty: {
      [AttendanceStatus.ENUM.ABSENT]: user.getDataValue("absent_count"),
      [AttendanceStatus.ENUM.LATE]: user.getDataValue("late_count"),
      [AttendanceStatus.ENUM.EARLY_DEPARTURE]: user.getDataValue(
        "early_departure_count",
      ),
    },
    leave_balance_deficit: user.leave_balances.length,
    period: `${year}-${month.toString().padStart(2, "0")}`,
  }));

  return await payrollRepository.bulkCreate(data, {
    updateOnDuplicate: ["attendance_penalty", "leave_balance_deficit"],
    conflictAttributes: ["user_id", "period"],
  });
}

exports.generatePayroll = async (payload) => {
  const {
    payroll_id,
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
  } = payload.body;

  if (payroll_id) return generateSinglePayroll(payroll_id);
  return generateMonthlyPayroll(month, year);
};

exports.downloadMonthlyPayroll = async (payload) => {
  let { period = Period.getCurrentPeriod() } = payload.query;

  const data = await payrollRepository.findAll({
    period: period,
  });

  return {
    filename: `Monthly-PayRoll-${period}.xlsx`,
    buffer: await ExcelUtility.writeFile(
      DownloadExcel.ENUM.MONTHLY_PAYROLL,
      data,
    ),
  };
};
