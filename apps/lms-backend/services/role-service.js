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
const { Op, Sequelize } = require("sequelize");
const { userRepository } = require("../repositories/user-repository");

exports.getFilteredRoles = async () => {
  return await roleRepository.findAll(
    {},
    [],
    true,
    ["uuid", "name", "created_at", "code", "description"],
    undefined,
    {
      order: [
        ["created_at", "DESC"],
        ["id", "DESC"],
      ],
    },
  );
};

exports.createRole = async (payload) => {
  const transaction = await transactionRepository.startTransaction();

  try {
    const role = await roleRepository.create(payload.body, { transaction });

    const defaultOrgSetting = await organizationSettingRepository.findOne({
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

  const transaction = await transactionRepository.startTransaction();

  try {
    await roleRepository.update(
      { uuid: role_uuid },
      restPayload,
      [],
      transaction,
    );

    if (organization_setting) {
      const roleId = roleRepository.getLiteralFrom("role", role_uuid, "uuid");

      const previousOrgSetting = await organizationSettingRepository.findOne({
        role_id: {
          [Op.eq]: roleId,
        },
      });

      if (!previousOrgSetting) {
        throw new NotFoundError(
          "Organization setting not found.",
          "Organization setting for this role was not found.",
        );
      }

      const {
        sandwich_leave_exception,
        clubbing_leave_exception,
        past_dated_leave,
        late_exception,
      } = organization_setting;

      const getBalanceDifference = (newValue, previousValue) => {
        if (newValue === null) {
          return null;
        }

        if (newValue?.balance === undefined) {
          return undefined;
        }

        return Number(newValue.balance) - Number(previousValue?.balance || 0);
      };

      const pdlBalance = getBalanceDifference(
        past_dated_leave,
        previousOrgSetting.past_dated_leave,
      );

      const sleBalance = getBalanceDifference(
        sandwich_leave_exception,
        previousOrgSetting.sandwich_leave_exception,
      );

      const cleBalance = getBalanceDifference(
        clubbing_leave_exception,
        previousOrgSetting.clubbing_leave_exception,
      );

      const leBalance = getBalanceDifference(
        late_exception,
        previousOrgSetting.late_exception,
      );

      const updatePayload = {};

      if (pdlBalance === null) {
        updatePayload.past_dated_leave_balance = 0;
      } else if (pdlBalance !== undefined && pdlBalance !== 0) {
        updatePayload.past_dated_leave_balance = Sequelize.literal(`
          GREATEST(
            0,
            COALESCE("past_dated_leave_balance", 0) + ${pdlBalance}
          )
        `);
      }

      if (sleBalance === null) {
        updatePayload.sandwich_leave_exception_balance = 0;
      } else if (sleBalance !== undefined && sleBalance !== 0) {
        updatePayload.sandwich_leave_exception_balance = Sequelize.literal(`
          GREATEST(
            0,
            COALESCE("sandwich_leave_exception_balance", 0) + ${sleBalance}
          )
        `);
      }

      if (cleBalance === null) {
        updatePayload.clubbing_leave_exception_balance = 0;
      } else if (cleBalance !== undefined && cleBalance !== 0) {
        updatePayload.clubbing_leave_exception_balance = Sequelize.literal(`
          GREATEST(
            0,
            COALESCE("clubbing_leave_exception_balance", 0) + ${cleBalance}
          )
        `);
      }

      if (leBalance === null) {
        updatePayload.late_exception_balance = 0;
      } else if (leBalance !== undefined && leBalance !== 0) {
        updatePayload.late_exception_balance = Sequelize.literal(`
          GREATEST(
            0,
            COALESCE("late_exception_balance", 0) + ${leBalance}
          )
        `);
      }

      if (Object.keys(updatePayload).length) {
        await userRepository.update(
          {
            role_id: {
              [Op.eq]: roleId,
            },
          },
          updatePayload,
          [],
          transaction,
        );
      }

      await organizationSettingRepository.update(
        {
          role_id: {
            [Op.eq]: roleId,
          },
        },
        organization_setting,
        [],
        transaction,
      );
    }

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
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
