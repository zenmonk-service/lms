const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
class UserRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user.schema(getSchema()),
    });
  }

  _getAssociation() {
    const include = [
      {
        association: this.model.role,
        model: db.tenants.role.schema(getSchema()),
        include: [
          {
            model: db.tenants.role_permission.schema(getSchema()),
            as: "role_permissions",
            include: [
              {
                model: db.tenants.permission.schema(getSchema()),
                as: "permission",
                attributes: ["tag", "action"],
              },
            ],
          },
        ],
      },
      {
        association: this.model.organization_shift,
        model: db.tenants.organization_shift.schema(getSchema()),
      },
      {
        association: this.model.personal_information,
        model: db.tenants.user_personal_information.schema(getSchema()),
      },
      {
        association: this.model.documents,
        model: db.tenants.user_document.schema(getSchema()),
      },
    ];
    return include;
  }

  async getFilteredUsers(
    { email, is_active, month },
    { archive, page: pageOption, limit: limitOption, search },
  ) {
    let criteria = {};
    let paranoid = true;
    if (is_active) criteria.is_active = { [Op.eq]: is_active };
    if (email) criteria.email = { [Op.like]: `%${email}%` };
    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (archive) paranoid = false;
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    const include = this._getAssociation();
    if (month) {
      include.push({
        association: this.model.leave_balances,
        model: db.tenants.leave_balance.schema(getSchema()),
        required: false,
        where: {
          period: month,
        },
        include: [
          {
            model: db.tenants.leave_type.schema(getSchema()),
            as: "leave_type",
          },
        ],
      });
    }

    const { rows, count } = await this.findAndCountAll(
      criteria,
      include,
      offset,
      limit,
      [["created_at", "ASC"]],
    );

    return {
      rows,
      count,
      current_page: page + 1,
      per_page: limit,
      total: await this.count(),
    };
  }

  async getUserById(userUuid, withAssociations = true, transaction) {
    let criteria = { user_id: { [Op.eq]: userUuid } };
    const include = this._getAssociation();
    return this.findOne(
      criteria,
      withAssociations ? include : [],
      undefined,
      undefined,
      transaction,
    );
  }

  async listUserAttendanceReport(
    { startDate, endDate, month },
    { page: pageOption = 1, limit: limitOption = 10, search },
  ) {
    const criteria = {};

    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { offset, limit, page } = new Paginator(pageOption, limitOption);

    const include = [
      {
        association: this.model.attendances,
        model: db.tenants.attendance.schema(getSchema()),
        required: false,
        where: {
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        attributes: ["date", "status", "check_in", "check_out"],
      },
      {
        association: this.model.leave_requests,
        model: db.tenants.leave_request.schema(getSchema()),
        required: false,
        where: {
          start_date: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: db.tenants.leave_type.schema(getSchema()),
            as: "leave_type",
            attributes: ["name"],
          },
        ],
      },
      {
        association: this.model.leave_balances,
        model: db.tenants.leave_balance.schema(getSchema()),
        required: false,
        where: {
          period: month,
        },
        attributes: ["leaves_allocated", "balance", "final_balance"],
      },
    ];

    const { rows, count } = await this.findAndCountAll(
      criteria,
      include,
      offset,
      limit,
      [["created_at", "ASC"]],
      true,
      ['name','created_at','image', 'email','user_id']
    );

    return {
      rows,
      count,
      current_page: page + 1,
      per_page: limit,
      total: await this.count(),
    };
  }
}

module.exports = {
  userRepository: new UserRepository({ sequelize: db.sequelize }),
};
