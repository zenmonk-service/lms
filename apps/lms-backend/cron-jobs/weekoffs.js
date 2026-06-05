const moment = require("moment");
const { Op } = require("sequelize");
const { setSchema } = require("../lib/schema");
const {
  organizationRepository,
} = require("../repositories/organization-repository");
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

exports.createWeekOffEntries = async () => {
  const organizations = await organizationRepository.findAll();

  for (const organization of organizations) {
    setSchema(organization.uuid);

    const organizationSetting =
      await organizationSettingRepository.getOrganizationSetting();
    const workingDays = organizationSetting?.work_days || [];

    if (workingDays.length === 0) {
      continue;
    }

    const users = await userRepository.findAll(
      { is_active: { [Op.eq]: true } },
      [],
      true,
      ["id"],
    );

    if (users.length === 0) {
      continue;
    }

    const startDate = moment().startOf("day");
    const endDate = moment().add(3, "months").endOf("day");
    const userIds = users.map((user) => user.id);

    const existingAttendances = await attendanceRepository.findAll(
      {
        user_id: { [Op.in]: userIds },
        date: {
          [Op.between]: [
            startDate.format("YYYY-MM-DD"),
            endDate.format("YYYY-MM-DD"),
          ],
        },
      },
      [],
      true,
      ["user_id", "date"],
    );

    const existingDates = new Set(
      existingAttendances.map(
        (attendance) =>
          `${attendance.user_id}:${moment(attendance.date).format("YYYY-MM-DD")}`,
      ),
    );

    const attendancePayload = [];

    for (const user of users) {
      let currDate = startDate.clone();

      while (currDate.isSameOrBefore(endDate, "day")) {
        const dayName = currDate.format("dddd").toLowerCase();
        const dateString = currDate.format("YYYY-MM-DD");
        const attendanceKey = `${user.id}:${dateString}`;

        if (!workingDays.includes(dayName) && !existingDates.has(attendanceKey)) {
          attendancePayload.push({
            date: dateString,
            user_id: user.id,
            status: AttendanceStatus.ENUM.WEEK_OFF,
          });
        }

        currDate.add(1, "day");
      }
    }

    if (attendancePayload.length > 0) {
      console.log("attendancePayload: ", attendancePayload);
      await attendanceRepository.bulkCreateAttendances(attendancePayload);
    }
  }
};
