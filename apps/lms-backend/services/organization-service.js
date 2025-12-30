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
const { getSchema, setSchema } = require("../lib/schema");
const { Op } = require("sequelize");
const {
  DayStatus,
} = require("../models/tenants/organization/enum/day-status-enum");
const { AttendanceStatus } = require("../models/tenants/attendance/enum/attendance-status-enum");

exports.getFilteredOrganizations = async (payload) => {
  payload = await validatingQueryParameters({
    ...payload,
    repository: organizationRepository,
  });
  let {
    page: pageOption = 1,
    limit: limitOption = 10,
    order: order_type = "DESC",
    order_column = "created_at",
    search,
  } = payload.query;
  const { offset, limit, page } = new Paginator(pageOption, limitOption);
  const include = [
    {
      association: db.public.organization.users,
    },
  ];
  const order = [[order_column, order_type]];
  const criteria = {};
  if (search) {
    criteria.name = {
      [Op.iLike]: `%${search}%`,
    };
  }
  const response = await organizationRepository.findAndCountAll(
    criteria,
    include,
    offset,
    limit,
    order,
    true
  );
  response.current_page = page + 1;
  response.per_page = limit;
  response.total = await organizationRepository.count({}, { paranoid: true });
  return response;
};

exports.createOrganization = async (payload) => {
  try {
    const organization = await organizationRepository.create(payload);
    const schemaName = organization.getOrganizationSchemaName();

    await createSchemaAndRunMigrations(schemaName);
    await runSeeders(schemaName);
  } catch (err) {
    throw new Error(err);
  }
};

exports.updateOrganization = async (payload) => {
  await organizationRepository.updateOrganization(
    payload.params.organization_uuid,
    payload.body
  );
};

exports.listUserOrganizations = async (payload) => {
  const { user_id } = payload.params;
  const { search } = payload.query;

  const { offset, limit, page } = new Paginator(
    payload.query.page,
    payload.query.limit
  );

  const where = {};
  if (search) {
    where.name = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const include = [
    {
      model: db.public.user,
      where: { user_id },
      through: {
        attributes: [],
        where: { is_active: true },
      },
      attributes: [],
    },
  ];

  const response = await organizationRepository.findAndCountAll(
    where,
    include,
    offset,
    limit
  );

  response.current_page = page + 1;
  response.per_page = limit;
  response.total = await organizationRepository.count(where, include);

  return response;
};

exports.loggedInOrganization = async (payload) => {
  const { email, organizationId } = payload.body;
  setSchema(organizationId);
  const include = [
    {
      model: db.tenants.role.schema(getSchema()),
      as: "role",

      include: [
        {
          model: db.tenants.role_permission.schema(getSchema()),
          as: "role_permissions",

          include: [
            {
              model: db.tenants.permission.schema(getSchema()),
              as: "permission",
            },
          ],
        },
      ],
    },
  ];
  const userData = await userRepository.findOne({ email }, include);

  if (!userData) {
    throw new NotFoundError(
      "User not found",
      "User with provided email not found"
    );
  }

  return userData;
};

exports.getOrganizationByUUID = (payload) => {
  const { organization_uuid } = payload.params;
  if (!organization_uuid) {
    throw new BadRequestError("organization uuid not provided");
  }

  const organizationDetails = organizationRepository.findOne({
    uuid: organization_uuid,
  });

  if (!organizationDetails) {
    throw new NotFoundError("organization not found");
  }
  return organizationDetails;
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
    month,
    year = new Date().getFullYear(),
    start_date,
    end_date,
    day_status,
    archive = false,
    page = 1,
    limit = 100,
  } = payload.query;

  // const organization = await organizationRepository.getOrganizationById(
  //   organization_uuid
  // );
  // if (!organization.isActive())
  //   throw new ForbiddenError("Organization is currently inactive.");

  return organizationEventRepository.getFilteredOrganizationEvents(
    { date, month, year, start_date, end_date, day_status },
    { archive, page, limit }
  );
};

exports.addOrganizationEvent = async (payload) => {
  // const { organization_uuid } = payload.params;

  // const organization = await organizationRepository.getOrganizationById(
  //   organization_uuid
  // );
  // if (!organization.isActive())
  //   throw new ForbiddenError("Organization is currently inactive.");

  const organizationEvent =
    await organizationEventRepository.createOrganizationEvent({
      ...payload.body,
    });

  if (payload.body.day_status == DayStatus.ENUM.ORGANIZATION_HOLIDAY) {
    const organizationUsers = await userRepository.findAll();

    const attendancePayload = [];
    organizationUsers.map((user) => {
      let currDate = new Date(payload.body.start_date);
      const endDate = new Date(new Date(payload.body.end_date).getTime() - 1);

      while (currDate <= endDate) {
        attendancePayload.push({
          date: new Date(currDate),
          user_id: user.id,
          status: AttendanceStatus.ENUM.HOLIDAY,
          organization_holiday_id: organizationEvent.id,
        });

        currDate.setDate(currDate.getDate() + 1);
      }
    });
    await attendanceRepository.bulkCreateAttendances(attendancePayload);
  }
};

exports.updateOrganizationEvent = async (payload) => {
  const { event_uuid } = payload.params;

  return organizationEventRepository.updateOrganizationEvent(
    event_uuid,
    payload.body
  );
};

exports.deleteOrganizationEvent = async (payload) => {
  const { event_uuid } = payload.params;

  return organizationEventRepository.deleteOrganizationEvent(event_uuid);
};
