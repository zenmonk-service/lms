const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const rolePermissionModel = require("../models/tenants/role/role-permission-model");

class RoleRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.role.schema(getSchema()),
    });
  }

  async getFilteredRoles() {
    return await this.findAll({}, [], null, {});
  }

  async createRole(payload) {
    const { name, description, code } = payload;
    const rolePayload = {
      name,
      description,
      code,
    };
    return this.create(rolePayload);
  }

  async getRoleById(roleUUID) {
    let criteria = { uuid: { [Op.eq]: roleUUID } };
    const attributes = { exclude: ["id"] };

    const include = [
      {
        model: db.tenants.role_permission.schema(getSchema()),
        as: "role_permissions",
        include: [
          {
            model: db.tenants.permission.schema(getSchema()),
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

  async updateRoleById(roleUUID, payload) {
    const criteria = { uuid: { [Op.eq]: roleUUID } };
    return await this.update(criteria, payload);
  }
}

module.exports = {
  roleRepository: new RoleRepository({
    sequelize: db.sequelize,
  }),
};
