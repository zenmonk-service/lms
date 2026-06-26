const db = require("../models");
const { BaseRepository } = require("./base-repository");

class UserLeaveTypeRepository extends BaseRepository {
 constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user_leave_type,
    });
  }
}

module.exports = {
  userLeaveTypeRepository: new UserLeaveTypeRepository({
    sequelize: db.sequelize,
  }),
};
