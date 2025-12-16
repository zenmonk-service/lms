const { NotFoundError, BadRequestError } = require("../middleware/error");
const { isValidDate, isValidUUID } = require("../models/common/validator");

const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");

const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");
const {
  leaveRequestRepository,
} = require("../repositories/leave-request-repository");
const {
  leaveRequestManagerRepository,
} = require("../repositories/leave-request-manager-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const { Op } = require("sequelize");
const {
  LeaveRequestStatus,
} = require("../models/tenants/leave/enum/leave-request-status-enum");
const { userRepository } = require("../repositories/user-repository");

exports.validatingQueryParameters = async (payload) => {
  let {
    user_uuid,
    leave_type_uuid,
    manager_uuid,
    date,
    start_date,
    end_date,
    date_range,
    managers,
    status,
    archive = false,
  } = payload.query;

  if (archive === "true" || archive === true) payload.query.archive = true;
  else payload.query.archive = false;

  if (date && !isValidDate(date))
    throw new BadRequestError(
      "Invalid date.",
      "Date parameter is not a valid date string."
    );
  if (date) payload.query.date = new Date(date);

  if (start_date && !isValidDate(start_date))
    throw new BadRequestError(
      "Invalid start date.",
      "Start date parameter is not a valid date string."
    );
  if (start_date) payload.query.start_date = new Date(start_date);
  else payload.query.start_date = new Date(new Date().getFullYear(), 0, 1);

  if (end_date && !isValidDate(end_date))
    throw new BadRequestError(
      "Invalid end date.",
      "End date parameter is not a valid date string."
    );
  if (end_date) payload.query.end_date = new Date(end_date);
  else payload.query.end_date = new Date(+new Date().getFullYear() + 1, 0, 1);

  if (date_range && !Array.isArray(date_range) && date_range.length != 2)
    throw new BadRequestError(
      "Invalid date_range.",
      "Date range must include start date and end date."
    );
  if (user_uuid && !isValidUUID(user_uuid))
    throw new BadRequestError(
      "Invalid user uuid.",
      "User uuid is not a valid uuid string."
    );

  if (leave_type_uuid && !isValidUUID(leave_type_uuid))
    throw new BadRequestError(
      "Invalid leave type uuid.",
      "Leave type uuid is not a valid uuid string."
    );

  if (manager_uuid && !isValidUUID(manager_uuid))
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string."
    );

  if (status && !LeaveRequestStatus.isValidValue(status))
    throw new BadRequestError(
      "Invalid status.",
      "Status parameter is not a valid status string."
    );

  return payload;
};

exports.getFilteredLeaveRequests = async (payload) => {
  payload = await this.validatingQueryParameters(payload);
  let {
    user_uuid,
    leave_type_uuid,
    manager_uuid,
    managers,
    date,
    date_range,
    status,
    archive = false,
    page = 1,
    limit = 10,
  } = payload.query;

  return leaveRequestRepository.getFilteredLeaveRequests(
    {
      user_uuid,
      leave_type_uuid,
      manager_uuid,
      managers,
      date,
      date_range,
      status,
    },
    { archive, page, limit }
  );
};

exports.createLeaveRequest = async (payload) => {
  const leaveType = await leaveTypeRepository.findOne({
    uuid: payload.body.leave_type_uuid,
  });
  if (!leaveType.isActive()) throw new ForbiddenError("Leave Type is currently inactive.");

  const user = await userRepository.findOne({
    user_id: payload.body.user_uuid,
  });

  if (!user.isActive()) throw new ForbiddenError("User is currently inactive.");

  const leaveTypeId = await leaveRequestRepository.getLiteralFrom(
    "leave_type",
    payload.body.leave_type_uuid,
    "uuid"
  );

  const leaveBalance = await leaveBalanceRepository.findOne({
    user_id: { [Op.eq]: user.id },
    leave_type_id: {
      [Op.eq]: leaveTypeId,
    },
  });

  if (!leaveBalance)
    throw new NotFoundError(
      "Leave balance not found.",
      "User do not have any leave balance alloted from this type."
    );

  let leaveDuration = await leaveRequestRepository.model.calculateLeaveDuration(
    payload.body
  );
  if (
    leaveType.max_consecutive_days &&
    leaveDuration > leaveType.max_consecutive_days
  ) {
    throw new BadRequestError(
      "Leave duration exceeds maximum consecutive days allowed.",
      `The maximum allowed consecutive days for this leave type is ${leaveType.max_consecutive_days}.`
    );
  }

  payload.body.leave_duration = leaveDuration;

  if (!payload.body.managers || payload.body.managers?.length === 0)
    throw new BadRequestError(
      "No managers found.",
      "Please provide at least one manager to approve this leave request."
    );
  if (payload.body.managers?.some((manager) => !isValidUUID(manager)))
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string."
    );
  if (
    payload.body.managers?.find((manager) => manager === payload.body.user_uuid)
  )
    throw new BadRequestError(
      "Invalid manager.",
      "User cannot be a manager of his/her own leave request."
    );

  return leaveRequestRepository.createLeaveRequest({
    ...payload.body,
    user_id: user.id,
    leave_type_id: leaveTypeId,
  });
};

exports.getLeaveRequestByUUID = async (payload) => {
  const { leave_request_uuid } = payload.params;
  return leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
};

exports.updateLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid,
      transaction
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found."
      );

    if (!leaveRequest.isPending())
      throw new BadRequestError(
        "Invalid leave request status.",
        "Leave request is not in pending status. Only pending leave requests can be updated."
      );
    const userId = await leaveRequestRepository.getLiteralFrom(
      "user",
      payload.body.user_uuid,
      "user_id"
    );
    const leaveTypeId = await leaveRequestRepository.getLiteralFrom(
      "leave_type",
      payload.body.leave_type_uuid,
      "uuid"
    );

    const leaveBalance = await leaveBalanceRepository.findOne({
      user_id: { [Op.eq]: userId },
      leave_type_id: {
        [Op.eq]: leaveTypeId,
      },
    });
    if (!leaveBalance)
      throw new NotFoundError(
        "Leave balance not found.",
        "User do not have any leave balance alloted from this type."
      );
    const leaveDuration =
      await leaveRequestRepository.model.calculateLeaveDuration(payload.body);

    if (leaveDuration > leaveBalance.balance)
      throw new BadRequestError(
        "Insufficient leave balance.",
        "User do not have enough leave balance to apply for this leave request."
      );

    if (!payload.body.managers || payload.body.managers?.length === 0)
      throw new BadRequestError(
        "No managers found.",
        "Please provide at least one manager to approve this leave request."
      );
    if (payload.body.managers?.some((manager) => !isValidUUID(manager)))
      throw new BadRequestError(
        "Invalid manager uuid.",
        "Manager uuid is not a valid uuid string."
      );

    if (
      payload.body.managers?.find(
        (manager) => manager === payload.body.user_uuid
      )
    )
      throw new BadRequestError(
        "Invalid manager.",
        "User cannot be a manager of his/her own leave request."
      );
    leaveRequest.managers.forEach((manager) => {
      if (!payload.body?.managers?.includes(manager.user.user_id))
        manager.destroy({ transaction });
    });

    const leaveRequestManagers = payload.body.managers.map((uuid) => {
      return {
        leave_request_id: leaveRequest.id,
        user_id: leaveRequestManagerRepository.getLiteralFrom(
          "user",
          uuid,
          "user_id"
        ),
      };
    });

    await leaveRequestManagerRepository.bulkCreate(leaveRequestManagers, {
      transaction,
      ignoreDuplicates: true,
    });

    await leaveRequestRepository.updateLeaveRequestById(
      leave_request_uuid,
      payload.body,
      transaction
    );
    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.approveLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required."
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string."
    );

  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid,
      transaction
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found."
      );

    const manager = leaveRequest.managers.find(
      (manager) => manager.user.user_id === manager_uuid
    );
    if (!manager)
      throw new BadRequestError(
        "Invalid manager.",
        "User is not a manager of this leave request."
      );
    manager.setRemark(remark);
    await manager.save({ transaction });

    await leaveRequest.approve(manager.user);
    const response = await leaveRequest.save({ transaction });

    await leaveRequest.leave_balance.deductBalanceBy(
      leaveRequest.leave_duration
    );
    await leaveRequest.leave_balance.save({ transaction });

    await transactionRepository.commitTransaction(transaction);
    return response;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.recommendLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required."
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string."
    );

  const transaction = await transactionRepository.startTransaction();

  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found."
      );

    const manager = leaveRequest.managers.find(
      (manager) => manager.user.user_id === manager_uuid
    );
    if (!manager)
      throw new BadRequestError(
        "Invalid manager.",
        "User is not a manager of this leave request."
      );
    manager.setRemark(remark);
    await manager.save({ transaction });

    leaveRequest.recommend(manager.user);
    await leaveRequest.save({ transaction });
    await transactionRepository.commitTransaction(transaction);
    return leaveRequest;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.rejectLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required."
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string."
    );

  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found."
      );

    const manager = leaveRequest.managers.find(
      (manager) => manager.user.user_id === manager_uuid
    );
    if (!manager)
      throw new BadRequestError(
        "Invalid manager.",
        "User is not a manager of this leave request."
      );
    manager.setRemark(remark);
    await manager.save({ transaction });

    leaveRequest.reject(manager.user);
    await leaveRequest.save({ transaction });
    await transactionRepository.commitTransaction(transaction);
    return leaveRequest;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.deleteLeaveRequest = async (payload) => {
  const { leave_request_uuid, user_uuid } = payload.params;
  const user = await userRepository.findOne({ user_id: user_uuid });

  const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
    leave_request_uuid
  );
  if (!leaveRequest)
    throw new NotFoundError(
      "Leave request not found.",
      "Leave request with provided id not found."
    );

  leaveRequest.cancel(user);
  return leaveRequest.save();
};
