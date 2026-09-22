const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");

exports.updateOrganizationSetting = async (payload) => {
  const settings = await organizationSettingRepository.findOne({
    uuid: payload.params.setting_uuid,
  });

  if (!settings) {
    throw new NotFoundError(
      "Organization setting not found.",
      "Organization setting for this role was not found.",
    );
  }

  const transaction = await transactionRepository.startTransaction();
  try {
    if (settings.role_id) {
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
        settings.past_dated_leave,
      );

      const sleBalance = getBalanceDifference(
        sandwich_leave_exception,
        settings.sandwich_leave_exception,
      );

      const cleBalance = getBalanceDifference(
        clubbing_leave_exception,
        settings.clubbing_leave_exception,
      );

      const leBalance = getBalanceDifference(
        late_exception,
        settings.late_exception,
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
    }

    await organizationSettingRepository.update(
      { id: settings.id },
      payload.body,
      [],
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getOrganizationSetting = async (payload) => {
  const { role_uuid = null } = payload.query;
  return await organizationSettingRepository.getOrganizationSetting(role_uuid);
};

exports.createOrganizationSetting = async (payload) => {
  return await organizationSettingRepository.create(payload.body);
};
