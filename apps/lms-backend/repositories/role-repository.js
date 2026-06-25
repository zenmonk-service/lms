const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Op } = require("sequelize");
const rolePermissionModel = require("../models/tenants/role/role-permission-model");

class RoleRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.role,
    });
  }

  async getRoleById(roleUUID) {
    let criteria = { uuid: { [Op.eq]: roleUUID } };
    const attributes = { exclude: ["id"] };

    const include = [
      {
        model: this.tenant(db.tenants.role_permission),
        as: "role_permissions",
        include: [
          {
            model: this.tenant(db.tenants.permission),
            as: "permission",
          },
        ],
      },
    ];

    const options = {};

    return await this.findOne(
      criteria,
      include,
      true,
      attributes,
      null,
      options
    );
  }
}

module.exports = {
  roleRepository: new RoleRepository({
    sequelize: db.sequelize,
  }),
};
