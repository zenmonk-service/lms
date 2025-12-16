const { Op } = require("sequelize");
const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");
const {
  organizationRepository,
} = require("../repositories/organization-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const {
  validatingQueryParameters,
} = require("../lib/validate-query-parameters");
const { NotFoundError } = require("../middleware/error");

exports.getFilteredLeaveTypes = async (payload) => {
  payload = await validatingQueryParameters({
    ...payload,
    repository: leaveTypeRepository,
  });
  let { page = 1, limit = 10, order, order_column, search } = payload.query;

  return leaveTypeRepository.getFilteredLeaveTypes(
    { search },
    { order_type: order, order_column, page, limit }
  );
};

exports.createLeaveType = async (payload) => {
  const leaveTypePayload = payload.body;
  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveType = await leaveTypeRepository.create(leaveTypePayload, {
      transaction,
    });

    const applicableFor = leaveType.getApplicableFor();

    const criteria = {};
    if (applicableFor.type === "role" && applicableFor.value != "all") {
      criteria.role_id = {
        [Op.in]: applicableFor.value.map((role_uuid) =>
          userRepository.getLiteralFrom("role", role_uuid, "uuid")
        ),
      };
    }

    const userIds = await userRepository.findAll(
      criteria,
      [],
      undefined,
      ["id"],
      transaction
    );

    const leaveBalances = userIds.map((user) => ({
      user_id: user.id,
      leave_type_id: leaveType.id,
      balance: leaveType.getLeaveCount() ?? 0,
      leaves_allocated: leaveType.getLeaveCount() ?? 0,
    }));
    await leaveBalanceRepository.bulkCreate(leaveBalances, { transaction });

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getLeaveTypeById = async (payload) => {
  const { leave_type_uuid } = payload.params;
  return leaveTypeRepository.getLeaveTypeById(leave_type_uuid);
};

exports.updateLeaveTypeById = async (payload) => {
  const { leave_type_uuid } = payload.params;
  const leaveType = payload.body;
  const response = await leaveTypeRepository.updateLeaveTypeById(
    leave_type_uuid,
    leaveType
  );
  return response;
};

exports.activateLeaveType = async (payload) => {
  const { leave_type_uuid } = payload.params;

  const leaveType = await leaveTypeRepository.findOne({
    uuid: leave_type_uuid,
  });
  if (!leaveType) throw new NotFoundError("Leave Type not found");

  leaveType.activate();

  return leaveType.save();
};

exports.deactivateLeaveType = async (payload) => {
  const { leave_type_uuid } = payload.params;

  const leaveType = await leaveTypeRepository.findOne({
    uuid: leave_type_uuid,
  });
  if (!leaveType) throw new NotFoundError("Leave Type not found");

  leaveType.deactivate();

  return leaveType.save();
};
