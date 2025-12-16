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
const { NotFoundError, BadRequestError } = require("../middleware/error");
const db = require("../models");
const { getSchema, setSchema } = require("../lib/schema");
const { Op } = require("sequelize");

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

exports.getOrganizationByUUID = () => {
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
