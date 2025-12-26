const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");
const { Op, Sequelize } = require("sequelize");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const { BadRequestError } = require("../middleware/error");
const { Paginator } = require("./common/pagination");
const { generateDateRange } = require("./common/date-validations");

class AttendanceRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.attendance.schema(getSchema()),
    });
  }

  async getFilteredAttendance(
    {
      user_uuid,
      date,
      date_range,
      organization_role_uuid,
      department_uuid,
      status,
    },
    { page: pageOption, limit: limitOption }
  ) {
    const criteria = {};
    const userCriteria = {};
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    if (user_uuid) {
      userCriteria.user_id = { [Op.eq]: user_uuid };
    }

    if (organization_role_uuid) {
      userCriteria.organization_role_id = {
        [Op.eq]: this.getLiteralFrom(
          "organization_role",
          organization_role_uuid
        ),
      };
    }

    if (department_uuid) {
      userCriteria.department_id = {
        [Op.eq]: this.getLiteralFrom("department", department_uuid),
      };
    }

    // if (organization_uuid) {
    //   userCriteria.organization_id = {
    //     [Op.eq]: this.getLiteralFrom("organization", organization_uuid),
    //   };
    // }

    const include = [
      {
        association: this.model.user,
        attributes: ["user_id", "name"],
        where: userCriteria,
      },
      {
        association: this.model.attendance_log,
      },
    ];
    const countAssociation = [
      {
        association: this.model.user,
        attributes: [],
        where: userCriteria,
      },
    ];

    if (date) {
      const start_date = new Date(date);
      start_date.setHours(0, 0, 0, 0);
      const end_date = new Date(date);
      end_date.setHours(23, 59, 59, 999);
      criteria.date = { [Op.between]: [start_date, end_date] };
    }

    if (date_range) criteria.date = { [Op.between]: date_range };

    if (status) criteria.status = { [Op.eq]: status };
    if (user_uuid) {
      const userId = this.getLiteralFrom("user", user_uuid, "user_id");
      criteria.user_id = { [Op.eq]: userId };
    }

    const response = await this.findAll(criteria, include, null);
    const finalResponse = {};
    finalResponse.rows = response;
    finalResponse.current_page = page + 1;
    finalResponse.per_page = limit;
    finalResponse.total = await this.count({}, { include: countAssociation });
    return finalResponse;
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

  async getAttendanceByCriteria({ user_uuid, date, leave_type_id, user_id }) {
    const criteria = {};
    const include = [
      {
        association: this.model.attendance_log,
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
    return this.findOne(criteria, include);
  }

  async createAttendance(userUUID, transaction) {
    const criteria = {
      user_id: { [Op.eq]: this.getLiteralFrom("user", userUUID, "user_id") },
      date: {
        [Op.between]: [
          new Date().setHours(0, 0, 0, 0),
          new Date().setHours(23, 59, 59, 999),
        ],
      },
    };

    const payload = {
      user_id: this.getLiteralFrom("user", userUUID, "user_id"),
      date: new Date(),
      check_in: new Date().toTimeString().split(" ")[0],
      status: AttendanceStatus.ENUM.ON_DUTY,
    };

    return this.upsert(criteria, payload, { transaction });
  }

  async recordAttendance({ user_uuid, date }, payload, transaction) {
    const criteria = {
      user_id: this.getLiteralFrom("user", user_uuid, "user_id"),
    };

    if (!user_uuid)
      throw new BadRequestError(
        "User UUID is required to update attendance record"
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

  async getAttendanceStatus({ status, user_uuid, date_range }) {
    const criteria = {};
    if (date_range) criteria.date = { [Op.between]: date_range };

    if (user_uuid) {
      const userId = this.getLiteralFrom("user", user_uuid, "user_id");
      criteria.user_id = { [Op.eq]: userId };
    }
    const statusCounts = await this.findAll(criteria, [], true, ["status"]);
    return statusCounts;
  }

  async getAttendanceAffectedHours({ date_range, user_uuid }) {
    const criteria = {};

    const [startDate, endDate] = date_range;
    const formattedStartDate = new Date(startDate).setHours(0, 0, 0, 0);

    if (date_range)
      criteria.date = { [Op.between]: [formattedStartDate, endDate] };

    if (user_uuid) {
      const userId = this.getLiteralFrom("user", user_uuid, "user_id");
      criteria.user_id = { [Op.eq]: userId };
    }
    const res = await this.findAll(criteria, [], true, [
      "affected_hours",
      "date",
    ]);

    const allDates = generateDateRange(date_range);

    const dailyValues = allDates.reduce((acc, date) => {
      const data = res.find((item) => {
        return new Date(item.date).toISOString().split("T")[0] === date;
      });

      acc.push({
        date,
        affected_hours: data ? parseFloat(data.affected_hours) : 0,
      });

      return acc;
    }, []);

    return dailyValues;
  }

  async getTotalHours({ user_uuid, date_range }) {
    const criteria = {};
    const userCriteria = {};
    if (user_uuid) {
      userCriteria.user_id = { [Op.eq]: user_uuid };
      criteria.user_id = {
        [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id"),
      };
    }
    // if (organization_uuid)
    //   userCriteria.organization_id = {
    //     [Op.eq]: this.getLiteralFrom("organization", organization_uuid),
    //   };

    if (date_range) {
      const [startDate, endDate] = date_range;
      const formattedStartDate = new Date(startDate).setHours(0, 0, 0, 0);
      criteria.date = { [Op.between]: [formattedStartDate, endDate] };
    }
    const include = [
      {
        association: this.model.user,
        where: userCriteria,
        attributes: [],
        required: false,
      },
    ];
    const attribute = [
      [
        this.sequelize.fn("SUM", this.sequelize.col("affected_hours")),
        "total_hours",
      ],
      [
        this.sequelize.fn("COUNT", this.sequelize.col("user.id")),
        "count_users",
      ],
    ];
    const res = await this.findAll(
      criteria,
      include,
      true,
      attribute,
      undefined,
      { group: ["user.organization_id"] }
    );
    if (!res[0]) {
      return 0.0;
    }
    return res[0]?.toJSON().total_hours || 0.0;
  }
}

module.exports = {
  attendanceRepository: new AttendanceRepository({
    sequelize: db.sequelize,
  }),
};
