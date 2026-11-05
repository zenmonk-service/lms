const { Op, Sequelize } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
const { AttendanceStatus, Permission, Action, Period } = require("@repo/common");

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
          {
            model: this.tenant(db.tenants.organization_setting),
            as: "organization_setting",
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
        include: [
          {
            association: db.tenants.user_document.attachments,
            model: this.tenant(db.tenants.attachment),
          },
        ],
      },
    ];
    return include;
  }

  async getFilteredUsers(
    { email, is_active, month, managers_required, team_uuids },
    { archive, page: pageOption, limit: limitOption, search },
  ) {
    const criteria = {};
    if (is_active) criteria.is_active = { [Op.eq]: is_active };
    if (email) criteria.email = { [Op.like]: `%${email}%` };
    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (team_uuids?.length) {
      // UUIDs are validated by the service before reaching here.
      const uuidList = team_uuids.map((uuid) => `'${uuid}'`).join(", ");
      criteria.id = {
        [Op.in]: Sequelize.literal(`(
          SELECT ut.user_id
          FROM "${this.schema}"."user_team" ut
          JOIN "${this.schema}"."team" t ON t.id = ut.team_id AND t.deleted_at IS NULL
          WHERE t.uuid IN (${uuidList})
        )`),
      };
    }

    if (managers_required) {
      const approverRoles = await this.tenant(db.tenants.role).findAll({
        attributes: ["id"],
        raw: true,
        include: [
          {
            model: this.tenant(db.tenants.role_permission),
            as: "role_permissions",
            attributes: [],
            required: true,
            include: [
              {
                model: this.tenant(db.tenants.permission),
                as: "permission",
                attributes: [],
                required: true,
                where: {
                  tag: Permission.ENUM.LEAVE_REQUEST_MANAGEMENT,
                  action: Action.ENUM.APPROVE,
                },
              },
            ],
          },
        ],
      });

      criteria.role_id = {
        [Op.in]: [...new Set(approverRoles.map((role) => role.id))],
      };
    }

    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    const include = this._getAssociation();
    if (month) {
      include.push({
        association: this.model.leave_balances,
        model: this.tenant(db.tenants.leave_balance),
        where: { period: month },
        required: false,
        include: [
          {
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
      [
        ["created_at", "DESC"],
        ["id", "DESC"],
      ],
    );

    return {
      rows,
      count,
      current_page: page + 1,
      per_page: limit,
      total: await this.count(),
    };
  }

  async getUserById(
    { user_uuid, emp_code },
    withAssociations = true,
    transaction,
    withHierarchy = false,
  ) {
    let criteria = {};
    if (user_uuid) {
      criteria.user_id = { [Op.eq]: user_uuid };
    }
    if (emp_code) {
      criteria.emp_code = emp_code;
    }
    const include = this._getAssociation();
    if (withHierarchy) {
      include.push(
        {
          model: this.tenant(db.tenants.team),
          as: "teams",
          attributes: ["uuid", "name"],
          through: { model: this.tenant(db.tenants.user_team), attributes: [] },
          required: false,
        },
      );
    }
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
        attributes: [
          "date",
          "status",
          "check_in",
          "check_out",
          "uuid",
          "affected_hours",
        ],
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
      {
        association: this.model.role,
        model: this.tenant(db.tenants.role),
      },
    ];

    const { rows, count } = await this.findAndCountAll(
      criteria,
      include,
      offset,
      limit,
      [
        ["created_at", "DESC"],
        ["id", "DESC"],
      ],
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

  async listUserByCriteria({
    date,
    date_range,
    status,
    search,
    period,
    periods,
    role_uuids,
    user_uuids,
  }) {
    const andConditions = [{ is_active: true }];

    const attendanceCriteria = {};
    const payrollCriteria = {};
    const leaveBalanceCriteria = {};

    if (period) {
      payrollCriteria.period = period;
    }

    if (periods) {
      leaveBalanceCriteria.period = {
        [Op.in]: periods,
      };
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
      andConditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    if (role_uuids?.length || user_uuids?.length) {
      const roleUserCriteria = [];

      if (role_uuids?.length) {
        roleUserCriteria.push({
          role_id: {
            [Op.in]: role_uuids.map((roleUuid) =>
              this.getLiteralFrom("role", roleUuid),
            ),
          },
        });
      }

      if (user_uuids?.length) {
        roleUserCriteria.push({
          user_id: {
            [Op.in]: user_uuids,
          },
        });
      }

      andConditions.push({ [Op.or]: roleUserCriteria });
    }

    const criteria = { [Op.and]: andConditions };

    const include = [
      {
        association: this.model.roles,
        model: this.tenant(db.tenants.role),
        as: "role",
        required: false,
        include: [
          {
            model: this.tenant(db.tenants.organization_setting),
            as: "organization_setting",
          },
        ],
      },
    ];

    if (date || date_range || status) {
      include.push({
        association: this.model.attendances,
        model: this.tenant(db.tenants.attendance),
        required: !!status,
        where: attendanceCriteria,
        attributes: ["date", "status", "check_in", "check_out", "uuid" , "affected_hours"],
      });
    }

    if (period) {
      include.push({
        association: this.model.payrolls,
        model: this.tenant(db.tenants.payroll),
        required: false,
        where: payrollCriteria,
      });
    }

    if (periods) {
      include.push({
        association: this.model.leave_balances,
        model: this.tenant(db.tenants.leave_balance),
        required: false,
        where: leaveBalanceCriteria,
        include: [
          {
            model: this.tenant(db.tenants.leave_type),
            as: "leave_type",
          },
        ],
      });
    }

    return this.findAll(criteria, include);
  }
  async getUserPayroll({ date_range, user_id, transaction= undefined }) {
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

    return this.findAll(criteria, include, true, attributes, transaction, {
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

  // ───────────── Hierarchy (reporting lines live in user_team) ─────────────

  /**
   * Ids of the users on the org canvas: everyone, the members of `teamId`, or
   * `rootId` plus `descendantIds` when a root is given.
   */
  async findHierarchyIds({ teamId, rootIds }) {
    const s = this.schema;
    const conditions = ["u.deleted_at IS NULL"];
    if (teamId) {
      conditions.push(
        `u.id IN (SELECT ut.user_id FROM "${s}"."user_team" ut WHERE ut.team_id = :teamId AND ut.manager_id IS NULL)`,
      );
    }
    if (rootIds) conditions.push("u.id IN (:rootIds)");
    const [rows] = await this.sequelize.query(
      `SELECT u.id FROM "${s}"."user" u WHERE ${conditions.join(" AND ")}`,
      { replacements: { teamId: teamId ?? null, rootIds: rootIds ?? null } },
    );
    return rows.map((row) => row.id);
  }

  /** Users with role and teams, for hierarchy and chain responses. */
  async findHierarchyUsers(ids) {
    if (!ids.length) return [];
    return this.findAll(
      { id: { [Op.in]: ids } },
      [
        {
          model: this.tenant(db.tenants.role),
          as: "role",
          attributes: ["uuid", "name"],
        },
        {
          model: this.tenant(db.tenants.team),
          as: "teams",
          attributes: ["uuid", "name"],
          through: { model: this.tenant(db.tenants.user_team), attributes: [] },
          required: false,
        },
      ],
      true,
      ["id", "user_id", "name", "email", "emp_code", "image", "is_active"],
    );
  }

  /** Resolves user UUIDs to rows; throws nothing, callers compare lengths. */
  async findByUuids(uuids, transaction) {
    if (!uuids.length) return [];
    return this.findAll(
      { user_id: { [Op.in]: uuids } },
      [],
      true,
      ["id", "user_id", "name", "is_active"],
      transaction,
    );
  }
}

module.exports = {
  userRepository: new UserRepository({ sequelize: db.sequelize }),
};
