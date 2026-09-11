const { BaseRepository } = require("./base-repository");
const db = require("../models");

class LeaveBalanceLogRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_balance_log,
    });
  }
}

module.exports = {
  leaveBalanceLogRepository: new LeaveBalanceLogRepository({
    sequelize: db.sequelize,
  }),
};
