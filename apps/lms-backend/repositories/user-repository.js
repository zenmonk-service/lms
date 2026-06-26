const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
class UserRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user,
    });
  }

  _getAssociation() {
    const include = [
      {
        association: this.model.role,
        model: this.tenant(db.tenants.role),
        include: [
          {
            model: this.tenant(db.tenants.role_permission),
            as: "role_permissions",
            include: [
              {
                model: this.tenant(db.tenants.permission),
                as: "permission",
                attributes: ["tag", "action"],
              },
            ],
          },
        ],
      },
      {
        association: this.model.organization_shift,
        model: this.tenant(db.tenants.organization_shift),
      },
      {
        association: this.model.personal_information,
        model: this.tenant(db.tenants.user_personal_information),
      },
      {
        association: this.model.documents,
        model: this.tenant(db.tenants.user_document),
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
        model: this.tenant(db.tenants.leave_balance),
        where: {
          period: month,
        },
        include: [
          {
            model:this.tenant( db.tenants.leave_type),
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
    { startDate, endDate, month, status },
    { page: pageOption = 1, limit: limitOption = 10, search },
  ) {
    const criteria = {};
    const attendanceCriteria=  {};

    attendanceCriteria.date =  {
            [Op.between]: [startDate, endDate],
    };

    if(status) {
      attendanceCriteria.status = status;
    }

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
        model: this.tenant(db.tenants.attendance),
        required: false,
        where: attendanceCriteria,
        attributes: ["date", "status", "check_in", "check_out",'uuid'],
      },
      {
        association: this.model.leave_requests,
        model: this.tenant(db.tenants.leave_request),
        required: false,
        where: {
          start_date: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: this.tenant(db.tenants.leave_type),
            as: "leave_type",
            attributes: ["name"],
          },
        ],
      },
      {
        association: this.model.leave_balances,
        model: this.tenant(db.tenants.leave_balance),
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
