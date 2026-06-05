const { Op } = require("sequelize");
const { BaseRepository } = require("./base-repository");
const { NotFoundError } = require("../middleware/error");
const { sequelize } = require("../config/db-connection");
const db = require("../models");
const { AttendanceLogType } = require("../models/tenants/attendance/enum/attendance-log-type-enum");
const { getSchema } = require("../lib/schema");


class AttendanceLogRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.attendance_log.schema(getSchema()),
    });
  }

  async getAttendanceLog({ attendance_id, location }) {
    const criteria = {};
    if (attendance_id) criteria.attendance_id = { [Op.eq]: attendance_id };
    if (location) criteria.location = location;
    return this.findAll(criteria);
  }

  async createAttendanceLog({ attendance_id, location, type }, transaction) {
    const time = new Date().toTimeString().split(" ")[0];
    const payload = { attendance_id, time, location, type };

    return this.create(payload, { transaction });
  }

  async recordAttendanceLog({ attendance_id, location, updates }, transaction) {
    const { check_in, check_out } = updates;

    if (check_in) {
      const payload = {
        attendance_id,
        location,
        type: AttendanceLogType.ENUM.CHECK_IN,
        time: check_in,
      };
      await this.create(payload, { transaction });
    }
    if (check_out) {
      const payload = {
        attendance_id,
        location,
        type: AttendanceLogType.ENUM.CHECK_OUT,
        time: check_out,
      };
      await this.create(payload, { transaction });
    }

    return true;
  }

  async bulkCreateAttendanceLog(payload, transaction) {
    return this.bulkCreate(payload, {
      transaction,
      updateOnDuplicate: ["check_in", "check_out"],
    });
  }
}

module.exports = {
  attendanceLogRepository: new AttendanceLogRepository({
    sequelize: db.sequelize,
  }),
};
