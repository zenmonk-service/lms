const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
class LeaveTypeRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_type,
    });
  }

  async getFilteredLeaveTypes(
    { search, user_uuid },
    { order_type, order_column },
  ) {
    let criteria = {};
    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let order = undefined;

    if (order_type && order_column) {
      order = [[order_column, order_type]];
    }

    const userInclude = {
      model: this.tenant(db.tenants.user),
      as: "users",
      through: {
        model: this.tenant(db.tenants.user_leave_type),
        attributes: [],
      },
    };

    if (user_uuid) {
      userInclude.where = { user_id: user_uuid };
      userInclude.required = true;
    }

    const include = [
      userInclude,
      {
        model: this.tenant(db.tenants.role),
        as: "roles",
        through: {
          model: this.tenant(db.tenants.role_leave_type),
          attributes: [],
        },
      },
    ];

    const response = await this.findAll(
      criteria,
      include,
      true,
      undefined,
      undefined,
      order && { order },
    );

    return { rows: response };
  }
}

module.exports = {
  leaveTypeRepository: new LeaveTypeRepository({ sequelize: db.sequelize }),
};
