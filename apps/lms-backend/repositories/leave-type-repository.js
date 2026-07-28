const { Op, Sequelize } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class LeaveTypeRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_type,
    });
  }

  async getFilteredLeaveTypes(
    { search, user_uuid, role_uuid },
    { order_type, order_column },
  ) {
    let criteria = {};

    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let order;

    if (order_type && order_column) {
      order = [[order_column, order_type]];
    }

    const include = [
      {
        model: this.tenant(db.tenants.user),
        as: "users",
        required: !!user_uuid,
        through: {
          model: this.tenant(db.tenants.user_leave_type),
          attributes: [],
          ...(user_uuid && {
            where: Sequelize.literal(
              `"user_id" = ${this.getLiteralFrom("user", user_uuid, "user_id").val}`,
            ),
          }),
        },
      },
      {
        model: this.tenant(db.tenants.role),
        as: "roles",
        required: !!role_uuid,
        through: {
          model: this.tenant(db.tenants.role_leave_type),
          attributes: [],
          ...(role_uuid && {
            where: Sequelize.literal(
              `"role_id" = ${this.getLiteralFrom("role", role_uuid, "uuid").val}`,
            ),
          }),
        },
      },
    ];

    const response = await this.findAll(
      criteria,
      include,
      true,
      undefined,
      undefined,
      {
        ...(order && { order }),
        distinct: true,
      },
    );

    return { rows: response };
  }
}

module.exports = {
  leaveTypeRepository: new LeaveTypeRepository({
    sequelize: db.sequelize,
  }),
};
