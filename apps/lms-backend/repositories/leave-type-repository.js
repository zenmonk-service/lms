const { Op } = require("sequelize");
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

    let order;

    if (order_type && order_column) {
      order = [[order_column, order_type]];
    }

    let userId;
    let roleId;

    if (user_uuid) {
      const user = await this.tenant(db.tenants.user).findOne({
        where: {
          user_id: user_uuid,
        },
        attributes: ["id", "role_id"],
      });

      if (user) {
        userId = user.id;
        roleId = user.role_id;
      }
    }

    const include = [
      {
        model: this.tenant(db.tenants.user),
        as: "users",
        required: false,
        through: {
          model: this.tenant(db.tenants.user_leave_type),
          attributes: [],
          ...(userId && {
            where: {
              user_id: userId,
            },
          }),
        },
      },
      {
        model: this.tenant(db.tenants.role),
        as: "roles",
        required: false,
        through: {
          model: this.tenant(db.tenants.role_leave_type),
          attributes: [],
          ...(roleId && {
            where: {
              role_id: roleId,
            },
          }),
        },
      },
    ];

    if (userId || roleId) {
      criteria[Op.and] = [
        {
          [Op.or]: [
            ...(userId ? [{ "$users.id$": { [Op.ne]: null } }] : []),
            ...(roleId ? [{ "$roles.id$": { [Op.ne]: null } }] : []),
          ],
        },
      ];
    }

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
