const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class RoleLeaveTypeRepository extends BaseRepository {
 constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.role_leave_type,
    });
  }
}

module.exports = {
  roleLeaveTypeRepository: new RoleLeaveTypeRepository({
    sequelize: db.sequelize,
  }),
};
