const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Op } = require("sequelize");
const { Paginator } = require("./common/pagination");
const { getSchema } = require("../lib/schema");
const rolePermissionModel = require("../models/tenants/role/role-permission-model");

class RoleRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.role.schema(getSchema()),
    });
  }

  async getFilteredRoles({ page: pageOption, limit: limitOption, search }) {
    let criteria = {
      // uuid: {
      //   [Op.ne]: "a3b1c6d4-5f27-4e1a-8b3c-9d0f12345678",
      // },
    };
    if (search) {
      criteria = {
        ...criteria,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    let response = {
      rows: [],
    };
    if (!pageOption || !limitOption) {
      response.rows = await this.findAll(criteria, []);
      response.current_page = 1;
      response.per_page = response.count;
    } else {
      const { offset, limit, page } = new Paginator(pageOption, limitOption);
      response = await this.findAndCountAll(criteria, [], offset, limit);
      response.current_page = page + 1;
      response.per_page = limit;
    }
    response.total = await this.count();
    return response;
  }

  async createRole(payload) {
    const { name, description } = payload;
    const rolePayload = {
      name,
      description,
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
