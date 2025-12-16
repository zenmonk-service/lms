const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class LeaveRequestManagerRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_request_manager.schema(getSchema()),
    });
  }
}

module.exports = {
  leaveRequestManagerRepository: new LeaveRequestManagerRepository({
    sequelize: db.sequelize,
  }),
};
