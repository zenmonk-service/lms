const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class RolePermissionRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.role_permission.schema(getSchema()),
    });
  }

}

module.exports = {
  rolePermissionRepository: new RolePermissionRepository({
    sequelize: db.sequelize,
  }),
};
