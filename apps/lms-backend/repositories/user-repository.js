const { Op, Sequelize } = require("sequelize");
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
        required: false,
        include: [
          {
            model: this.tenant(db.tenants.leave_type),
            model: this.tenant(db.tenants.leave_type),
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
    const attendanceCriteria = {};

    attendanceCriteria.date = {
      [Op.between]: [startDate, endDate],
    };

    if (status) {
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
        required: !!status,
        where: attendanceCriteria,
        attributes: ["date", "status", "check_in", "check_out", "uuid"],
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
      ["name", "created_at", "image", "email", "user_id"],
    );

    return {
      rows,
      count,
      current_page: page + 1,
      per_page: limit,
      total: await this.count(),
    };
  }

  async listUserAttendance({ date, date_range, status, search }) {
    const criteria = {};
    const attendanceCriteria = {};

    if (date_range) {
      attendanceCriteria.date = {
        [Op.between]: [date_range.start_date, date_range.end_date],
      };
    }

    if (date) {
      attendanceCriteria.date = {
        [Op.eq]: date,
      };
    }

    if (status) {
      attendanceCriteria.status = status;
    }

    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const include = [
      {
        association: this.model.attendances,
        model: this.tenant(db.tenants.attendance),
        required: !!status,
        where: attendanceCriteria,
        attributes: ["date", "status", "check_in", "check_out", "uuid"],
      },
    ];

    return this.findAll(criteria, include);
  }

  async getAttendanceRecords(month, year) {
    const criteria = {};
    criteria.is_active = { [Op.eq]: true };

    const include = [
      {
        model: this.tenant(db.tenants.attendance),
        association: this.model.attendances,
        where: {
          date: {
            [Op.between]: [
              new Date(year, month - 1, 1),
              new Date(year, month, 0),
            ],
          },
        },
      },
    ];

    return this.findAll(criteria, include);
  }

  async getUserPayrollData(userId, month, year) {
    const schema = this.model.getTableName().schema;
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const criteria = { is_active: { [Op.eq]: true }, id: { [Op.eq]: userId } };

    const attributes = {
      include: [
        [
          Sequelize.literal(`(
          SELECT COUNT(*)::int
          FROM "${schema}"."attendance" a
          WHERE a.user_id = "User"."id"
            AND a.status = 'absent'
            AND a.date BETWEEN '${startDate}' AND '${endDate}'
        )`),
          "absent_count",
        ],
        [
          Sequelize.literal(`(
          SELECT COUNT(*)::int
          FROM "${schema}"."attendance" a
          WHERE a.user_id = "User"."id"
            AND a.status = 'late'
            AND a.date BETWEEN '${startDate}' AND '${endDate}'
        )`),
          "late_count",
        ],
        [
          Sequelize.literal(`(
          SELECT COUNT(*)::int
          FROM "${schema}"."attendance" a
          WHERE a.user_id = "User"."id"
            AND a.status = 'early_departure'
            AND a.date BETWEEN '${startDate}' AND '${endDate}'
        )`),
          "early_departure_count",
        ],
      ],
    };

    const include = [
      {
        model: this.tenant(db.tenants.leave_balance),
        association: this.model.leave_balances,
        where: {
          period: `${year}-${month.toString()}`,
          balance: { [Op.lt]: 0 },
        },
        required: false,
      },
    ];

    return this.findOne(criteria, include, true, attributes);
  }

  async getUsersPayrollData(month, year) {
    const schema = this.model.getTableName().schema;
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const criteria = { is_active: { [Op.eq]: true } };

    const attributes = {
      include: [
        [
          Sequelize.literal(`(
          SELECT COUNT(*)::int
          FROM "${schema}"."attendance" a
          WHERE a.user_id = "User"."id"
            AND a.status = 'absent'
            AND a.date BETWEEN '${startDate}' AND '${endDate}'
        )`),
          "absent_count",
        ],
        [
          Sequelize.literal(`(
          SELECT COUNT(*)::int
          FROM "${schema}"."attendance" a
          WHERE a.user_id = "User"."id"
            AND a.status = 'late'
            AND a.date BETWEEN '${startDate}' AND '${endDate}'
        )`),
          "late_count",
        ],
        [
          Sequelize.literal(`(
          SELECT COUNT(*)::int
          FROM "${schema}"."attendance" a
          WHERE a.user_id = "User"."id"
            AND a.status = 'early_departure'
            AND a.date BETWEEN '${startDate}' AND '${endDate}'
        )`),
          "early_departure_count",
        ],
      ],
    };

    const include = [
      {
        model: this.tenant(db.tenants.leave_balance),
        association: this.model.leave_balances,
        where: {
          period: `${year}-${month.toString()}`,
          balance: { [Op.lt]: 0 },
        },
        required: false,
      },
    ];

    return this.findAll(criteria, include, true, attributes);
  }
}

module.exports = {
  userRepository: new UserRepository({ sequelize: db.sequelize }),
};
