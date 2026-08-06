const { setSchema } = require("../lib/schema");
const { TimePeriod } = require("../models/common/time-period-enum");
const { organizationSettingRepository } = require("../repositories/organization-setting-repository");
const { userRepository } = require("../repositories/user-repository");

function isPeriodApplicable(period) {
  const month = new Date().getMonth() + 1;

  switch (period) {
    case TimePeriod.ENUM.MONTHLY:
      return true;

    case TimePeriod.ENUM.QUARTERLY:
      return month % 3 === 0;

    case TimePeriod.ENUM.HALF_YEARLY:
      return [6, 12].includes(month);

    case TimePeriod.ENUM.YEARLY:
      return month === 12;

    default:
      return false;
  }
}

function hasExceptionAccess(config, user) {
  if (!config || !isPeriodApplicable(config.accrual_period)) {
    return false;
  }

  return (
    config.users.includes(user.user_id) ||
    config.roles.includes(user.role_id)
  );
}

exports.userBalances = async (organization_uuid) => {
  setSchema(organization_uuid);

  const organizationSetting =
    await organizationSettingRepository.findOne();

  const users = await userRepository.findAll({
    is_active: true,
  });

  const updates = users.map((user) => ({
    user_id: user.user_id,

    past_dated_leave_balance:
      organizationSetting?.past_dated_leave &&
      isPeriodApplicable(organizationSetting.past_dated_leave.tenure)
        ? organizationSetting.past_dated_leave.balance
        : null,

    sandwich_leave_exception: hasExceptionAccess(
      organizationSetting?.sandwich_leave_exception,
      user,
    ),

    clubbing_leave_exception: hasExceptionAccess(
      organizationSetting?.clubbing_leave_exception,
      user,
    ),
  }));

  await Promise.all(
    updates.map(({ user_id, ...payload }) =>
      userRepository.update({ user_id }, payload),
    ),
  );
};