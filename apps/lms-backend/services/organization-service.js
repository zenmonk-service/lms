const {
  createSchemaAndRunMigrations,
} = require("../scripts/create-schema-and-migrations");
const {
  organizationRepository,
} = require("../repositories/organization-repository");
const {
  validatingQueryParameters,
} = require("../lib/validate-query-parameters");
const { Paginator } = require("../repositories/common/pagination");
const { runSeeders } = require("../scripts/run-seeders");
const { userRepository } = require("../repositories/user-repository");
const {
  organizationEventRepository,
} = require("../repositories/organization-event-repository");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const { NotFoundError, BadRequestError } = require("../middleware/error");
const db = require("../models");
const { Op } = require("sequelize");
const {
  DayStatus,
} = require("../models/tenants/organization/enum/day-status-enum");
const { shiftRepository } = require("../repositories/shift-repository");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const { sendNotification } = require("./notification-service");
const { NotificationType } = require("./enum/notification-type.enum");
const {
  PublicUserRole,
} = require("../models/public/user/enum/public-user-role-enum");
const Period = require("../lib/period");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const {
  attendanceLogRepository,
} = require("../repositories/attendance-log-repository");
const {
  AttendanceLogType,
} = require("../models/tenants/attendance/enum/attendance-log-type-enum");

exports.getFilteredOrganizations = async (payload) => {
  let {
    order: order_type = "DESC",
    order_column = "created_at",
    search,
  } = payload.query;

  const include = [
    {
      association: db.public.organization.users,
      as: "users",
      where: { role: PublicUserRole.ENUM.ADMIN },
      required: false,
    },
  ];

  const order = [[order_column, order_type]];

  const criteria = {};

  if (search) {
    criteria.name = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const response = await organizationRepository.findAll(
    criteria,
    include,
    true,
    undefined,
    undefined,
    { order: [[order_column, order_type]] },
  );

  return response;
};

exports.createOrganization = async (payload) => {
  const organization = await organizationRepository.create(payload);
  const schemaName = organization.getOrganizationSchemaName();

  await createSchemaAndRunMigrations(schemaName);
  await runSeeders(schemaName);
};

exports.updateOrganization = async (payload) => {
  await organizationRepository.update(
    { uuid: payload.params.organization_uuid },
    payload.body,
  );
};

exports.listUserOrganizations = async (payload) => {
  const { user_id } = payload.params;
  const { search } = payload.query;

  const criteria = {};

  if (search) {
    criteria.name = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const include = [
    {
      model: db.public.user,
      as: "users",
      where: { user_id },
      through: {
        attributes: [],
        where: { is_active: true },
      },
      attributes: [],
    },
  ];

  const response = await organizationRepository.findAll(criteria, include);

  return response;
};

exports.getOrganizationByUUID = (payload) => {
  const { organization_uuid } = payload.params;
  if (!organization_uuid) {
    throw new BadRequestError("organization uuid not provided");
  }

  const organization = organizationRepository.findOne({
    uuid: organization_uuid,
  });

  if (!organization) {
    throw new NotFoundError("organization not found");
  }
  return organization;
};

exports.activateOrganization = async (payload) => {
  const { organization_uuid } = payload.params;

  const organization = await organizationRepository.findOne({
    uuid: organization_uuid,
  });
  if (!organization) throw new NotFoundError("Organization not found");

  organization.activate();

  return organization.save();
};

exports.deactivateOrganization = async (payload) => {
  const { organization_uuid } = payload.params;

  const organization = await organizationRepository.findOne({
    uuid: organization_uuid,
  });
  if (!organization) throw new NotFoundError("Organization not found");

  organization.deactivate();

  return organization.save();
};

exports.getFilteredOrganizationEvents = async (payload) => {
  let {
    date,
    period,
    year,
    start_date,
    end_date,
    day_status,
    archive = false,
    page = 1,
    limit = 100,
  } = payload.query;

  return organizationEventRepository.getFilteredOrganizationEvents(
    { date, period, year, start_date, end_date, day_status },
    { archive, page, limit },
  );
};

exports.addOrganizationEvent = async (payload) => {
  try {
    const { start_date, end_date, day_status, title } = payload.body;
    const transaction = await transactionRepository.startTransaction();

    const organizationEvent = await organizationEventRepository.create(
      payload.body,
      { transaction },
    );

    if (day_status == DayStatus.ENUM.ORGANIZATION_HOLIDAY) {
      const organizationUsers = await userRepository.findAll();

      const attendancePayload = [];
      organizationUsers.map((user) => {
        let currDate = Period.toMoment(start_date);
        const endDate = Period.toMoment(end_date);

        while (currDate.isSameOrBefore(endDate, "day")) {
          attendancePayload.push({
            date: currDate.format("YYYY-MM-DD"),
            user_id: user.id,
            status: AttendanceStatus.ENUM.HOLIDAY,
            organization_holiday_id: organizationEvent.id,
          });

          currDate = currDate.clone().add(1, "day");
        }
      });

      const response = await attendanceRepository.bulkCreateAttendances(
        attendancePayload,
        transaction,
      );

      const attendanceLogs = response.map((attendance) => {
        return {
          attendance_id: attendance.id,
          type: AttendanceLogType.ENUM.SYSTEM,
          status: attendance.status,
          remarks: `${title} Holiday created.`,
          action_by: payload.user.id,
        };
      });

      await attendanceLogRepository.bulkCreate(attendanceLogs, { transaction });
    }

    if (day_status == DayStatus.ENUM.WORKING_DAY) {
      const response = await attendanceRepository.update(
        {
          date: {
            [Op.between]: [
              Period.toMoment(start_date).format("YYYY-MM-DD"),
              Period.toMoment(end_date).format("YYYY-MM-DD"),
            ],
          },
        },
        {
          status: AttendanceStatus.ENUM.WORKING_DAY,
        },
      );

      console.log('response: ', response);
      const attendanceLogs = response[1].map((attendance) => {
        return {
          attendance_id: attendance.id,
          type: AttendanceLogType.ENUM.SYSTEM,
          status: AttendanceStatus.ENUM.WORKING_DAY,
          remarks: "Working day declared by system",
          action_by: payload.user.id,
        };
      });
      await attendanceLogRepository.bulkCreate(attendanceLogs, { transaction });
    }

    await sendNotification(payload.headers["org_uuid"], {
      send_to: "everyone",
      message: {
        type: NotificationType.ENUM.EVENT,
        text: `"${title}" (${day_status.replace("_", " ")}) event has been scheduled from ${start_date.split("T")[0]} to ${end_date.split("T")[0]}.`,
      },
    });
    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    console.log('error: ', error);
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.updateOrganizationEvent = async (payload) => {
  const { event_uuid } = payload.params;

  return organizationEventRepository.update({ uuid: event_uuid }, payload.body);
};

exports.deleteOrganizationEvent = async (payload) => {
  const { event_uuid } = payload.params;

  return organizationEventRepository.destroy({ uuid: event_uuid });
};

exports.listOrganizationShifts = async (req) => {
  return shiftRepository.findAll();
};
