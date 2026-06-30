const { AttendanceStatus } = require("../models/tenants/attendance/enum/attendance-status-enum");
const { Paginator } = require("../repositories/common/pagination");
const { payrollRepository } = require("../repositories/payroll-repository");
const { userRepository } = require("../repositories/user-repository");

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

  return await payrollRepository.getFilteredPayrolls(
    month,
    year,
    offset,
    currentPage,
    pageLimit,
    search
  );
};

exports.generatePayroll = async (payload) => {
  const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } =
    payload.query;

  const users = await userRepository.getUsersPayrollData(month, year);

  const data = users.map((user) => {
    const attendancePenalty = user.attendances.reduce(
      (acc, attendance) => {
        const status = attendance.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {
        [AttendanceStatus.ENUM.ABSENT]: 0,
        [AttendanceStatus.ENUM.LATE]: 0,
        [AttendanceStatus.ENUM.EARLY_DEPARTURE]: 0,
      },
    );

    return {
      user_id: user.id,
      attendance_penalty: attendancePenalty,
      leave_balance_deficit: user.leave_balances.length,
    };
  });

  return await payrollRepository.bulkCreate(data);
};
