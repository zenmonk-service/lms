const Period = require("../lib/period");
const { setSchema } = require("../lib/schema");
const { TimePeriod } = require("../models/common/time-period-enum");
const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");
const { userRepository } = require("../repositories/user-repository");

function isPeriodApplicable(period) {
  const month = Period.getCurrentMonth();

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

exports.leaveExceptions = async (organization_uuid) => {
  setSchema(organization_uuid);

  const {
    past_dated_leave,
    sandwich_leave_exception,
    clubbing_leave_exception,
  } = await organizationSettingRepository.findOne();

  const users = await userRepository.listUserByCriteria();

  const payload = users.map((userInstance) => {
    const user = userInstance.get({ plain: true });
    if (past_dated_leave && isPeriodApplicable(past_dated_leave.tenure)) {
      user.past_dated_leave_balance = past_dated_leave.balance;
    }

    if (
      sandwich_leave_exception &&
      isPeriodApplicable(sandwich_leave_exception.tenure) &&
      (sandwich_leave_exception.roles.includes(user.role.uuid) ||
        sandwich_leave_exception.users.includes(user.user_id))
    ) {
      user.sandwich_leave_exception = true;
    }

    if (
      clubbing_leave_exception &&
      isPeriodApplicable(clubbing_leave_exception.tenure) &&
      (clubbing_leave_exception.roles.includes(user.role.uuid) ||
        clubbing_leave_exception.users.includes(user.user_id))
    ) {
      user.clubbing_leave_exception = true;
    }

    return user;
  });
  await userRepository.bulkCreate(payload);
};
