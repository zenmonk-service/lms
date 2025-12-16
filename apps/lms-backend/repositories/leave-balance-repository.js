const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
class LeaveBalanceRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_balance.schema(getSchema()),
    });
  }
}

module.exports = {
  leaveBalanceRepository: new LeaveBalanceRepository({ sequelize: db.sequelize }),
};