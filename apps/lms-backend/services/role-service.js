const { ForbiddenError, NotFoundError } = require("../middleware/error");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const {
  rolePermissionRepository,
} = require("../repositories/role-permission-repository");
const {
  permissionRepository,
} = require("../repositories/permission-repository");
const {
  validatingQueryParameters,
} = require("../lib/validate-query-parameters");
const { roleRepository } = require("../repositories/role-repository");

exports.getFilteredRoles = async (payload) => {
  payload = await validatingQueryParameters({
    ...payload,
    repository: roleRepository,
  });
  let { page = 1, limit , search = "" } = payload.query;

  return await roleRepository.getFilteredRoles({
    page,
    limit,
    search,
  });
};

exports.createRole = async (payload) => {
  return roleRepository.createRole(payload.body);
};

exports.getRoleById = async (payload) => {
  const { role_uuid } = payload.params;
  return roleRepository.getRoleById(role_uuid);
};

exports.updateRoleById = async (payload) => {
  const { role_uuid } = payload.params;
  const { name, description } = payload.body;
  const roleData = { name, description };
  const response = await roleRepository.updateRoleById(role_uuid, roleData);

  if (response) {
    return roleRepository.getRoleById(role_uuid);
  }
  return null;
};

exports.updateRolePermissions = async (payload) => {
  const { role_uuid } = payload.params;
  const transaction = await transactionRepository.startTransaction();
  const role = await roleRepository.findOne({ uuid: role_uuid });

  if (!role) {
    await transactionRepository.rollbackTransaction(transaction);
    throw new NotFoundError(
      "Organization Role not found",
      `Organization Role with role UUID: ${role_uuid} not found`
    );
  }

  const permissions = 
    (payload.body.permission_uuids || []).map( (permission_uuid) => {
      const permission_id = rolePermissionRepository.getLiteralFrom(
        "permission",
        permission_uuid,
        "uuid"
      );
      return {
        role_id: role.id,
        permission_id,
      };
    })
  ;

  await rolePermissionRepository.destroy(
    { role_id: role.id },
    false,
    [],
    transaction
  );

  const rolePermissions = await rolePermissionRepository.bulkCreate(
    permissions,
    {
      updateOnDuplicate: ["role_id"],
      transaction,
    }
  );

  await transactionRepository.commitTransaction(transaction);
  return rolePermissions;
};
