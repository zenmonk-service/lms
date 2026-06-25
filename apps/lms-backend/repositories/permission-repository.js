const db = require("../models");
const { BaseRepository } = require("./base-repository");

class PermissionRepository extends BaseRepository {
 constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.permission,
    });
  }
}

module.exports = {
  permissionRepository: new PermissionRepository({
    sequelize: db.sequelize,
  }),
};
