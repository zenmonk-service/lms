const { BaseRepository } = require("./base-repository");
const db = require("../models");

class AttendanceLogRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.attendance_log,
    });
  }
}

module.exports = {
  attendanceLogRepository: new AttendanceLogRepository({
    sequelize: db.sequelize,
  }),
};
