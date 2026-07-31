const { Op, Sequelize } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const Period = require("../lib/period");

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
    if (is_active) criteria.is_active = { [Op.eq]: is_active };
    if (email) criteria.email = { [Op.like]: `%${email}%` };
    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
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

  async listUserDownloadData({ date, date_range, status, search, period }) {
    const criteria = {};
    const attendanceCriteria = {};
    const payrollCriteria = {};

    if (period) {
      payrollCriteria.period = period;
    }

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
      {
        association: this.model.payrolls,
        model: this.tenant(db.tenants.payroll),
        required: false,
        where: payrollCriteria,
      },
    ];

    return this.findAll(criteria, include);
  }

  async getUserPayroll({ date_range, user_id }) {
    const { start_date, end_date } = date_range;

    const criteria = {
      is_active: { [Op.eq]: true },
      ...(user_id && { id: { [Op.eq]: user_id } }),
    };

    const attributes = {
      include: [
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              `CASE WHEN "attendances"."status" = '${AttendanceStatus.ENUM.ABSENT}' THEN 1 END`,
            ),
          ),
          "absent_count",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              `CASE WHEN "attendances"."status" = '${AttendanceStatus.ENUM.LATE}' THEN 1 END`,
            ),
          ),
          "late_count",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              `CASE WHEN "attendances"."status" = '${AttendanceStatus.ENUM.EARLY_DEPARTURE}' THEN 1 END`,
            ),
          ),
          "early_departure_count",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              `CASE WHEN "attendances"."status" = '${AttendanceStatus.ENUM.MISSED_PUNCH}' THEN 1 END`,
            ),
          ),
          "missed_punch_count",
        ],
      ],
    };

    const include = [
      {
        model: this.tenant(db.tenants.attendance),
        as: "attendances",
        attributes: [],
        where: {
          date: { [Op.between]: [start_date, end_date] },
        },
        required: false,
      },
      {
        model: this.tenant(db.tenants.leave_balance),
        as: "leave_balances",
        where: {
          period: Period.convertPeriodFromDate(start_date),
          balance: { [Op.lt]: 0 },
        },
        required: false,
        include: [
          {
            model: this.tenant(db.tenants.leave_type),
            as: "leave_type",
            attributes: ["name", "code", "id"],
          },
        ],
        attributes: ["leaves_allocated", "final_balance", "balance"],
      },
    ];

    return this.findAll(criteria, include, true, attributes, undefined, {
      group: [
        `${this.model.name}.id`,
        "leave_balances.id",
        "leave_balances.leaves_allocated",
        "leave_balances.final_balance",
        "leave_balances->leave_type.name",
        "leave_balances->leave_type.code",
        "leave_balances->leave_type.id",
      ],
    });
  }
}

module.exports = {
  userRepository: new UserRepository({ sequelize: db.sequelize }),
};
