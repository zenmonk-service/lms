const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Op } = require("sequelize");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const { Paginator } = require("./common/pagination");
const Period = require("../lib/period");

class AttendanceRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.attendance,
    });
  }

  async getFilteredAttendance(
    { user_uuid, date, date_range, status, user_name_search },
    { page: pageOption, limit: limitOption },
  ) {
    const criteria = {
      status: {
        [Op.notIn]: [AttendanceStatus.ENUM.WEEK_OFF],
      },
      date: date ? { [Op.eq]: date } : { [Op.lte]: Period.getCurrentDate() },
    };
    const userCriteria = {};
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    if (user_uuid) {
      userCriteria.user_id = { [Op.eq]: user_uuid };
    }
    if (user_name_search)
      userCriteria.name = { [Op.iLike]: `%${user_name_search}%` };
    const include = [
      {
        association: this.model.user,
        attributes: ["user_id", "name"],
        where: userCriteria,
        model: this.tenant(db.tenants.user),
      },
      {
        association: this.model.attendance_log,
        model: this.tenant(db.tenants.attendance_log),
        order: [["time", "DESC"]],
        include: [
          {
            model: this.tenant(db.tenants.user),
            as: "performed_by",
            attributes: ["name"],
          },
        ],
      },
    ];
    const countAssociation = [
      {
        association: this.model.user,
        attributes: [],
        where: userCriteria,
        model: this.tenant(db.tenants.user),
      },
    ];

    if (date_range)
      criteria.date = {
        [Op.between]: [date_range.start_date, date_range.end_date],
      };

    if (status) criteria.status = { [Op.eq]: status };
    if (user_uuid) {
      const userId = this.getLiteralFrom("user", user_uuid, "user_id");
      criteria.user_id = { [Op.eq]: userId };
    }

    const response = await this.findAll(criteria, include, true, null, null, {
      offset,
      limit,
      order: [["date", "DESC"]],
    });

    const { start_date: currentMonthStart, end_date: currentMonthEnd } =
      Period.getPeriodDateRange(Period.getCurrentPeriod());

    const currentPresentMonthCriteria = {
      ...criteria,
      status: {
        [Op.or]: [
          AttendanceStatus.ENUM.PRESENT,
          AttendanceStatus.ENUM.HALF_DAY,
          AttendanceStatus.ENUM.SHORT_LEAVE,
          AttendanceStatus.ENUM.LATE,
          AttendanceStatus.ENUM.EARLY_DEPARTURE,
          AttendanceStatus.ENUM.WEEK_OFF,
          AttendanceStatus.ENUM.HOLIDAY,
        ],
      },
      date: { [Op.between]: [currentMonthStart, Period.getCurrentDate()] },
    };

    const currentAbsentMonthCriteria = {
      ...criteria,
      status: {
        [Op.or]: [AttendanceStatus.ENUM.ABSENT, AttendanceStatus.ENUM.ON_LEAVE],
      },
      date: {
        [Op.between]: [currentMonthStart, Period.getCurrentDate()],
      },
    };

    const presentMonthResponse = await this.count(currentPresentMonthCriteria);
    const absentMonthResponse = await this.count(currentAbsentMonthCriteria);

    const finalResponse = {};
    finalResponse.rows = response;
    finalResponse.current_page = page + 1;
    finalResponse.per_page = limit;
    finalResponse.total = await this.count(criteria, {
      include: countAssociation,
    });

    finalResponse.total_present_current_month = presentMonthResponse;
    finalResponse.total_absent_current_month = absentMonthResponse;
    return finalResponse;
  }

  async listAttendance({ user_id, date }) {
    const criteria = {};

    if (date) {
      criteria.date = date;
    }

    if (user_id) {
      criteria.user_id = user_id;
    }
    return this.findAll(criteria, [
      {
        association: this.model.attendance_log,
        model: this.tenant(db.tenants.attendance_log),
      },
    ]);
  }

  async getMissingAttendanceRecords(date_range) {
    const { start_date, end_date } = date_range;

    const query = `
    SELECT gs::date AS date
    FROM generate_series(
      :start_date::date,
      :end_date::date,
      INTERVAL '1 day'
    ) gs
    LEFT JOIN "${this.schema}"."attendance" a
      ON a.date = gs::date
    WHERE a.id IS NULL
    ORDER BY gs;
  `;

    return this.query(query, { start_date, end_date });
  }

  async getPerUserMissingAttendanceRecords(date_range) {
    const { start_date, end_date } = date_range;

    const query = `
    WITH all_dates AS (
        SELECT generate_series(
            :start_date::date,
            :end_date::date,
            interval '1 day'
        )::date AS date
    ),
    active_users AS (
        SELECT id AS user_id
        FROM "${this.schema}"."user"
        WHERE is_active = true
    )
    SELECT u.user_id, d.date
    FROM active_users u
    CROSS JOIN all_dates d
    WHERE NOT EXISTS (
        SELECT 1
        FROM "${this.schema}"."attendance" a
        WHERE a.user_id = u.user_id
          AND a.date = d.date
    )
    ORDER BY u.user_id, d.date;
  `;

    return this.query(query, { start_date, end_date });
  }

  async bulkCreateAttendances(payload, transaction) {
    const include = [
      {
        association: this.model.attendance_log,
        model: this.tenant(db.tenants.attendance_log),
      },
    ];
    return this.bulkCreate(payload, {
      include,
      transaction,
      updateOnDuplicate: [
        "check_in",
        "check_out",
        "status",
        "affected_hours",
        "leave_type_id",
        "organization_holiday_id",
      ],
      returning: true,
    });
  }

  async getAttendanceByCriteria(
    { user_uuid, date, leave_type_id, user_id, status },
    transaction,
  ) {
    const criteria = {};
    const include = [
      {
        association: this.model.attendance_log,
        model: this.tenant(db.tenants.attendance_log),
      },
    ];
    if (user_uuid)
      criteria.user_id = {
        [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id"),
      };
    if (user_id) criteria.user_id = { [Op.eq]: user_id };

    if (date) {
      const start_date = new Date(date);
      start_date.setHours(0, 0, 0, 0);
      const end_date = new Date(date);
      end_date.setHours(23, 59, 59, 999);
      criteria.date = { [Op.between]: [start_date, end_date] };
    }

    if (leave_type_id) {
      criteria.leave_type_id = { [Op.eq]: leave_type_id };
    }

    if (status) {
      criteria.status = status;
    }

    return this.findOne(criteria, include, true, undefined, transaction);
  }

  async getMonthlyAttendanceReport(startDate, endDate) {
    return this.findAll(
      {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      [],
      true,
      [
        [
          this.sequelize.fn("TO_CHAR", this.sequelize.col("date"), "YYYY-MM"),
          "month",
        ],
        [
          this.sequelize.fn(
            "COUNT",
            this.sequelize.literal(
              `CASE WHEN status = '${AttendanceStatus.ENUM.PRESENT}' THEN 1 END`,
            ),
          ),
          "present_count",
        ],
        [
          this.sequelize.fn(
            "COUNT",
            this.sequelize.literal(
              `CASE WHEN status = '${AttendanceStatus.ENUM.ABSENT}' THEN 1 END`,
            ),
          ),
          "absent_count",
        ],
        [
          this.sequelize.fn(
            "COUNT",
            this.sequelize.literal(
              `CASE WHEN status = '${AttendanceStatus.ENUM.ON_LEAVE}' THEN 1 END`,
            ),
          ),
          "on_leave_count",
        ],
        [
          this.sequelize.fn(
            "COUNT",
            this.sequelize.literal(
              `CASE WHEN status = '${AttendanceStatus.ENUM.LATE}' THEN 1 END`,
            ),
          ),
          "late_count",
        ],
      ],
      undefined,
      {
        group: [
          this.sequelize.fn("TO_CHAR", this.sequelize.col("date"), "YYYY-MM"),
        ],
        order: [
          [
            this.sequelize.fn("TO_CHAR", this.sequelize.col("date"), "YYYY-MM"),
            "ASC",
          ],
        ],
      },
    );
  }
}

module.exports = {
  attendanceRepository: new AttendanceRepository({
    sequelize: db.sequelize,
  }),
};
