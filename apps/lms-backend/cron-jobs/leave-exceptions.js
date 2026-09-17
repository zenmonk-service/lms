const { isPeriodApplicable } = require("../lib/constants");
const { setSchema } = require("../lib/schema");
const { userRepository } = require("../repositories/user-repository");

exports.leaveExceptions = async (organization_uuid) => {
  setSchema(organization_uuid);

  const users = await userRepository.listUserByCriteria();

  const payload = users.map((userInstance) => {
    const user = userInstance.get({ plain: true });
    const {
      past_dated_leave,
      sandwich_leave_exception,
      clubbing_leave_exception,
    } = user.role.organization_setting;

    if (past_dated_leave && isPeriodApplicable(past_dated_leave.tenure)) {
      user.past_dated_leave_balance = past_dated_leave.balance;
    }

    if (
      sandwich_leave_exception &&
      isPeriodApplicable(sandwich_leave_exception.tenure)
    ) {
      user.sandwich_leave_exception_balance = sandwich_leave_exception.tenure;
    }

    if (
      clubbing_leave_exception &&
      isPeriodApplicable(clubbing_leave_exception.tenure)
    ) {
      user.clubbing_leave_exception_balance = clubbing_leave_exception.tenure;
    }

    return user;
  });
  await userRepository.bulkCreate(payload);
};
