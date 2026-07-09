const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const { BadRequestError } = require("../middleware/error");
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
      date: date ? { [Op.eq]: date } : { [Op.lte]: new Date() },
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

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    currentMonthEnd.setHours(23, 59, 59, 999);

    const currentPresentMonthCriteria = {
      ...criteria,
      status: AttendanceStatus.ENUM.PRESENT,
      date: { [Op.between]: [currentMonthStart, currentMonthEnd] },
    };
    const currentAbsentMonthCriteria = {
      ...criteria,
      status: AttendanceStatus.ENUM.ABSENT,
      date: { [Op.between]: [currentMonthStart, currentMonthEnd] },
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

  async getMissingAttendanceRecords(month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return sequelize.query(
      `
      WITH all_dates AS (
          SELECT generate_series(
              :startDate::date,
              :endDate::date,
              interval '1 day'
          )::date AS date
      )
      SELECT d.date
      FROM all_dates d
      WHERE NOT EXISTS (
          SELECT 1
          FROM "${this.model.getTableName().schema}"."attendance" a
          WHERE a.date = d.date
      );
      `,
      {
        replacements: {
          startDate,
          endDate,
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  async getPerUserMissingAttendanceRecords(month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return sequelize.query(
      `
    WITH all_dates AS (
        SELECT generate_series(
            :startDate::date,
            :endDate::date,
            interval '1 day'
        )::date AS date
    ),
    active_users AS (
        SELECT id AS user_id
        FROM "${this.model.getTableName().schema}"."user"
        WHERE is_active = true
    )
    SELECT u.user_id, d.date
    FROM active_users u
    CROSS JOIN all_dates d
    WHERE NOT EXISTS (
        SELECT 1
        FROM "${this.model.getTableName().schema}"."attendance" a
        WHERE a.user_id = u.user_id
          AND a.date = d.date
    )
    ORDER BY u.user_id, d.date;
    `,
      {
        replacements: {
          startDate,
          endDate,
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  async getPerUserMissingAttendance(month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return sequelize.query(
      `
    WITH all_dates AS (
        SELECT generate_series(:startDate::date, :endDate::date, interval '1 day')::date AS date
    ),
    active_users AS (
        SELECT id FROM "${this.model.getTableName().schema}"."user" WHERE is_active = true AND deleted_at IS NULL
    )
    SELECT u.id AS user_id, d.date
    FROM active_users u
    CROSS JOIN all_dates d
    WHERE NOT EXISTS (
        SELECT 1 FROM "${this.model.getTableName().schema}"."attendance" a
        WHERE a.user_id = u.id AND a.date = d.date
    )
    ORDER BY u.id, d.date;
    `,
      { replacements: { startDate, endDate }, type: QueryTypes.SELECT },
    );
  }

  async bulkCreateAttendances(payload, transaction) {
    const include = [
      {
        association: this.model.attendance_log,
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

  async createAttendance(user_uuid, transaction) {
    const criteria = {
      user_id: { [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id") },
      date: {
        [Op.between]: [
          new Date().setHours(0, 0, 0, 0),
          new Date().setHours(23, 59, 59, 999),
        ],
      },
    };

    const payload = {
      user_id: this.getLiteralFrom("user", user_uuid, "user_id"),
      date: new Date(),
      check_in: Period.getCurrentTime(),
      status: AttendanceStatus.ENUM.PRESENT,
    };

    return this.upsert(criteria, payload, { transaction });
  }

  async recordAttendance({ user_uuid, date }, payload, transaction) {
    const criteria = {
      user_id: this.getLiteralFrom("user", user_uuid, "user_id"),
    };

    if (!user_uuid)
      throw new BadRequestError(
        "User UUID is required to update attendance record",
      );
    if (!date)
      throw new BadRequestError("Date is required to update attendance");

    const start_date = new Date(date);
    start_date.setHours(0, 0, 0, 0);
    const end_date = new Date(date);
    end_date.setHours(23, 59, 59, 999);
    criteria.date = { [Op.between]: [start_date, end_date] };

    const attendancePayload = {
      check_in: payload.check_in,
      check_out: payload.check_out,
      status: payload.status,
      user_id: this.getLiteralFrom("user", user_uuid, "user_id"),
      date: date,
    };
    return this.upsert(criteria, attendancePayload, { transaction });
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

  async listAttendances({ date, date_range, status, user_name_search }) {
    const criteria = {};
    const userCriteria = {};

    if (user_name_search)
      userCriteria.name = { [Op.iLike]: `%${user_name_search}%` };
    if (status) criteria.status = { [Op.eq]: status };
    if (date_range)
      criteria.date = {
        [Op.between]: [date_range.start_date, date_range.end_date],
      };

    const include = [
      {
        association: this.model.user,
        attributes: ["user_id", "name"],
        where: userCriteria,
        required: true,
        model: this.tenant(db.tenants.user),
      },
    ];

    if (date) {
      criteria.date = {
        [Op.eq]: date,
      };
    }

    return this.findAll(criteria, include);
  }
}

module.exports = {
  attendanceRepository: new AttendanceRepository({
    sequelize: db.sequelize,
  }),
};
