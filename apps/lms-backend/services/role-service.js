const { NotFoundError } = require("../middleware/error");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const {
  rolePermissionRepository,
} = require("../repositories/role-permission-repository");
const { roleRepository } = require("../repositories/role-repository");
const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");
const { Op } = require("sequelize");

exports.getFilteredRoles = async () => {
  return await roleRepository.findAll();
};

exports.createRole = async (payload) => {
  const transaction = await transactionRepository.startTransaction();

  try {
    const role = await roleRepository.create(payload.body, { transaction });

    const defaultOrgSetting =
      await organizationSettingRepository.findOne({
        role_id: null,
      });

    if (defaultOrgSetting) {
      const { id, ...orgSetting } = defaultOrgSetting.toJSON();

      await organizationSettingRepository.create(
        {
          ...orgSetting,
          role_id: role.id,
        },
        { transaction },
      );
    }

    await transactionRepository.commitTransaction(transaction);

    return role;
  } catch (error) {
    console.log("error: ", error);
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getRoleById = async (payload) => {
  const { role_uuid } = payload.params;
  return roleRepository.getRoleById(role_uuid);
};

exports.updateRoleById = async (payload) => {
  const { role_uuid } = payload.params;
  const { organization_setting, ...restPayload } = payload.body;

  await roleRepository.update({ uuid: role_uuid }, restPayload);
  if (organization_setting) {
    const role_id = await roleRepository.getLiteralFrom("role", role_uuid);
    await organizationSettingRepository.update(
      {
        role_id: {
          [Op.eq]: roleRepository.getLiteralFrom("role", role_uuid),
        },
      },
      organization_setting,
    );
  }
};

exports.updateRolePermissions = async (payload) => {
  const { role_uuid } = payload.params;
  const transaction = await transactionRepository.startTransaction();
  const role = await roleRepository.findOne({ uuid: role_uuid });

  if (!role) {
    await transactionRepository.rollbackTransaction(transaction);
    throw new NotFoundError(
      "Organization Role not found",
      `Organization Role with role UUID: ${role_uuid} not found`,
    );
  }

  const permissions = (payload.body.permission_uuids || []).map(
    (permission_uuid) => {
      const permission_id = rolePermissionRepository.getLiteralFrom(
        "permission",
        permission_uuid,
        "uuid",
      );
      return {
        role_id: role.id,
        permission_id,
      };
    },
  );

  await rolePermissionRepository.destroy(
    { role_id: role.id },
    false,
    [],
    transaction,
  );

  const rolePermissions = await rolePermissionRepository.bulkCreate(
    permissions,
    {
      updateOnDuplicate: ["role_id"],
      transaction,
    },
  );

  await transactionRepository.commitTransaction(transaction);
  return rolePermissions;
};
