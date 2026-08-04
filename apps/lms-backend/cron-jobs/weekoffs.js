const moment = require("moment-timezone");
const { setSchema } = require("../lib/schema");
const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");

exports.createWeekOffEntries = async (organization_uuid) => {
  setSchema(organization_uuid);

  const organizationSetting =
    await organizationSettingRepository.getOrganizationSetting();
  const workingDays = organizationSetting?.work_days || [];

  if (workingDays.length === 0) {
    return;
  }

  const users = await userRepository.findAll({ is_active: true });

  if (users.length === 0) {
    return;
  }

  const attendancePayload = users.flatMap((user) =>
    this.generateWeekOffAttendancePayload(user.id, workingDays),
  );

  const response =
    await attendanceRepository.bulkCreateAttendances(attendancePayload);
  const attendanceLogs = response.map((attendance) => {
    return {
      attendance_id: attendance.id,
      status: AttendanceStatus.ENUM.WEEK_OFF,
      type:AttendanceLogType.ENUM.SYSTEM,
      remarks: "Week-offs allocated by System.",
    };
  });

  await attendanceLogRepository.bulkCreate(attendanceLogs);
};

exports.generateWeekOffAttendancePayload = (user_id, workingDays) => {
  const startDate = moment().startOf("day");
  const endDate = moment().endOf("quarter");
  const attendancePayload = [];

  let currDate = startDate.clone();

  while (currDate.isSameOrBefore(endDate, "day")) {
    const dayName = currDate.format("dddd").toLowerCase();
    const dateString = currDate.format("YYYY-MM-DD");

    if (!workingDays.includes(dayName)) {
      attendancePayload.push({
        date: dateString,
        user_id: user_id,
        status: AttendanceStatus.ENUM.WEEK_OFF,
      });
    }

    currDate.add(1, "day");
  }

  return attendancePayload;
};
