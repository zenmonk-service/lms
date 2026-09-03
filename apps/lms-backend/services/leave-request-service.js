const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/error");
const { isValidUUID } = require("../models/common/validator");
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
const { userRepository } = require("../repositories/user-repository");
const {
  LeaveRequestType,
} = require("../models/tenants/leave/enum/leave-request-type-enum");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const {
  findSandwichLeavesBefore,
  findSandwichLeavesAfter,
} = require("../lib/leaves");
const { sendNotification } = require("./notification-service");
const { NotificationType } = require("./enum/notification-type.enum");
const {
  validatingQueryParameters,
} = require("../lib/validate-query-parameters");
const {
  attendanceLogRepository,
} = require("../repositories/attendance-log-repository");
const {
  AttendanceLogType,
} = require("../models/tenants/attendance/enum/attendance-log-type-enum");
const Period = require("../lib/period");
const { validateBodyParameters } = require("../lib/validate-body-paramenters");
const { CreateRoute } = require("./enum/create-routes-enum");
const moment = require("moment-timezone");
const {
  attachmentRepository,
} = require("../repositories/attachment-repository");
const {
  LeaveRequestStatus,
} = require("../models/tenants/leave/enum/leave-request-status-enum");

exports.getFilteredLeaveRequests = async (payload) => {
  payload = await validatingQueryParameters({
    ...payload,
    repository: leaveRequestRepository,
  });
  let {
    user_uuid,
    leave_type_uuid,
    manager_uuid,
    managers,
    date,
    date_range,
    status,
    search,
    user_name_search,
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
      search,
      user_name_search,
    },
    { archive, page, limit },
  );
};

exports.createLeaveRequest = async (payload) => {
  const {
    leave_type_uuid,
    start_date,
    end_date,
    managers,
    user_uuid,
    documents,
    type,
  } = payload.body;

  const leaveType = await leaveTypeRepository.findOne({
    uuid: leave_type_uuid,
  });

  if (leaveType && !leaveType.isActive()) {
    throw new ForbiddenError("Leave Type is currently inactive.");
  }

  const user = await userRepository.findOne({ user_id: user_uuid });

  if (user && !user.isActive()) {
    throw new ForbiddenError("User is currently inactive.");
  }

  const leaveBalance = await leaveBalanceRepository.findOne({
    user_id: { [Op.eq]: user.id },
    leave_type_id: { [Op.eq]: leaveType.id },
  });

  if (!leaveBalance) {
    throw new NotFoundError(
      "Leave balance not found.",
      "User do not have any leave balance allotted from this type.",
    );
  }

  let leaveDuration = 0;

  if (type === LeaveRequestType.ENUM.FULL_DAY) {
    const effectiveDayPayload = {
      query: {
        start_date,
        end_date,
        leave_type_uuid,
      },
      user: payload.user,
    };

    const { effective_days } =
      await this.listEffectiveDays(effectiveDayPayload);

    leaveDuration = effective_days;
  } else if (type === LeaveRequestType.ENUM.HALF_DAY) {
    leaveDuration = 0.5;
  } else if (type === LeaveRequestType.ENUM.SHORT_LEAVE) {
    leaveDuration = 0.25;
  }

  if (
    !leaveType.allow_negative_leaves &&
    leaveDuration > leaveBalance.balance
  ) {
    throw new BadRequestError(
      "Insufficient leave balance.",
      "User do not have enough leave balance to apply for this leave request.",
    );
  }
  const netDuration = Period.calculateLeaveDuration(start_date, end_date);

  if (
    leaveType.max_consecutive_days &&
    netDuration > leaveType.max_consecutive_days
  ) {
    throw new BadRequestError(
      "Leave duration exceeds maximum consecutive days allowed.",
      `The maximum allowed consecutive days for this leave type is ${leaveType.max_consecutive_days}.`,
    );
  }

  payload.body.leave_duration = netDuration;

  if (!managers || managers.length === 0) {
    throw new BadRequestError(
      "No managers found.",
      "Please provide at least one manager to approve this leave request.",
    );
  }

  if (managers.some((manager) => !isValidUUID(manager))) {
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string.",
    );
  }

  if (managers.includes(user_uuid)) {
    throw new BadRequestError(
      "Invalid manager.",
      "User cannot be a manager of his/her own leave request.",
    );
  }

  const transaction = await transactionRepository.startTransaction();

  try {
    const leaveRequest = await leaveRequestRepository.createLeaveRequest(
      {
        ...payload.body,
        user_id: user.id,
        leave_type_uuid,
      },
      transaction,
    );

    if (documents && documents.length > 0) {
      const attachmentPayload = documents.map((doc) => ({
        leave_request_id: leaveRequest.id,
        user_document_id: null,
        file_name: doc.file_name,
        file_url: doc.file_url,
        meta_data: doc.meta_data ?? null,
      }));

      await attachmentRepository.bulkCreate(attachmentPayload, { transaction });
    }

    await sendNotification(payload.headers.org_uuid, {
      send_to: managers,
      message: {
        type: NotificationType.ENUM.LEAVE,
        uuid: leaveRequest.uuid,
        text: `${user.name} has applied for a leave request.`,
      },
    });

    await transactionRepository.commitTransaction(transaction);
    return leaveRequest;
  } catch (err) {
    console.log("err: ", err);
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.getLeaveRequestByUUID = async (payload) => {
  const { leave_request_uuid } = payload.params;
  return leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
};

exports.updateLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;

  const {
    leave_type_uuid,
    start_date,
    end_date,
    managers,
    user_uuid,
    documents,
  } = payload.body;

  const transaction = await transactionRepository.startTransaction();

  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid,
      transaction,
    );

    if (!leaveRequest) {
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found.",
      );
    }

    if (!leaveRequest.isPending()) {
      throw new BadRequestError(
        "Invalid leave request status.",
        "Leave request is not in pending status. Only pending leave requests can be updated.",
      );
    }

    const leaveBalance = await leaveBalanceRepository.findOne({
      user_id: payload.user.id,
      leave_type_id: {
        [Op.eq]: leaveRequestRepository.getLiteralFrom(
          "leave_type",
          leave_type_uuid,
          "uuid",
        ),
      },
    });

    if (!leaveBalance) {
      throw new NotFoundError(
        "Leave balance not found.",
        "User do not have any leave balance allotted from this type.",
      );
    }

    let leaveDuration = 0;

    if (type === LeaveRequestType.ENUM.FULL_DAY) {
      const effectiveDayPayload = {
        query: {
          start_date,
          end_date,
          leave_type_uuid,
        },
        user: payload.user,
      };

      const { effective_days } =
        await this.listEffectiveDays(effectiveDayPayload);

      leaveDuration = effective_days;
    } else if (type === LeaveRequestType.ENUM.HALF_DAY) {
      leaveDuration = 0.5;
    } else if (type === LeaveRequestType.ENUM.SHORT_LEAVE) {
      leaveDuration = 0.25;
    }

    if (
      !leaveRequest.leave_type.allow_negative_leaves &&
      leaveDuration > leaveBalance.balance
    ) {
      throw new BadRequestError(
        "Insufficient leave balance.",
        "User do not have enough leave balance to apply for this leave request.",
      );
    }

    const netDuration = Period.calculateLeaveDuration(start_date, end_date);

    if (
      leaveRequest.leave_type.max_consecutive_days &&
      netDuration > leaveRequest.leave_type.max_consecutive_days
    ) {
      throw new BadRequestError(
        "Leave duration exceeds maximum consecutive days allowed.",
        `The maximum allowed consecutive days for this leave type is ${leaveRequest.leave_type.max_consecutive_days}.`,
      );
    }

    if (!managers || managers.length === 0) {
      throw new BadRequestError(
        "No managers found.",
        "Please provide at least one manager to approve this leave request.",
      );
    }

    if (managers.some((manager) => !isValidUUID(manager))) {
      throw new BadRequestError(
        "Invalid manager uuid.",
        "Manager uuid is not a valid uuid string.",
      );
    }

    if (managers.includes(user_uuid)) {
      throw new BadRequestError(
        "Invalid manager.",
        "User cannot be a manager of his/her own leave request.",
      );
    }

    leaveRequest.managers.forEach((manager) => {
      if (!managers.includes(manager.user.user_id)) {
        manager.destroy({ transaction });
      }
    });

    const leaveRequestManagers = managers.map((uuid) => ({
      leave_request_id: leaveRequest.id,
      user_id: leaveRequestManagerRepository.getLiteralFrom(
        "user",
        uuid,
        "user_id",
      ),
    }));

    await leaveRequestManagerRepository.bulkCreate(leaveRequestManagers, {
      transaction,
      ignoreDuplicates: true,
    });

    await attachmentRepository.destroy(
      { leave_request_id: leaveRequest.id },
      true,
      [],
      transaction,
    );

    if (documents && documents.length > 0) {
      const attachmentPayload = documents.map((doc) => ({
        leave_request_id: leaveRequest.id,
        user_document_id: null,
        file_name: doc.file_name,
        file_url: doc.file_url,
        meta_data: doc.meta_data ?? null,
      }));

      await attachmentRepository.bulkCreate(attachmentPayload, { transaction });
    }

    await leaveRequestRepository.updateLeaveRequestById(
      leave_request_uuid,
      {
        ...payload.body,
        leave_duration: netDuration,
      },
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    console.log("error: ", error);
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.approveLeaveRequest = async (payload) => {
  validateBodyParameters({
    payload,
    route: CreateRoute.ENUM.APPROVE_ATTENDANCE,
  });
  const { leave_request_uuid } = payload.params;
  const {
    manager_uuid,
    remark,
    status_changed_to = LeaveRequestStatus.ENUM.APPROVED,
    user_uuid,
  } = payload.body;

  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid,

      transaction,
    );
    const startDate = moment(
      Period.convertDateFromISO(leaveRequest.start_date),
    );
    const endDate = moment(Period.convertDateFromISO(leaveRequest.end_date));

    let currentStart = startDate.clone();

    while (currentStart.isSameOrBefore(endDate, "day")) {
      console.log("currentStart: ", currentStart);

      const endOfCurrentMonth = currentStart.clone().endOf("month");

      const chunkEnd = endOfCurrentMonth.isBefore(endDate)
        ? endOfCurrentMonth
        : endDate;

      await ApproveLeaves(
        currentStart.clone(),
        chunkEnd.clone(),
        leaveRequest,
        user_uuid,
        manager_uuid,
        remark,
        status_changed_to,
        transaction,
      );

      currentStart = chunkEnd.clone().add(1, "day");
    }

    console.log("currentStart: ", currentStart);
    console.log("enddate: ", endDate);
    console.log(
      "currentStart.isSameOrBefore(endDate): ",
      currentStart.isSameOrBefore(endDate),
    );

    await transactionRepository.commitTransaction(transaction);

    const organizationUuid = payload.headers["org_uuid"];
    await sendNotification(organizationUuid, {
      send_to: payload.body.user_uuid,
      message: {
        type: NotificationType.ENUM.GENERAL,
        text: `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been approved.`,
      },
    });
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.recommendLeaveRequest = async (payload) => {
  validateBodyParameters({
    payload,
    route: CreateRoute.ENUM.APPROVE_ATTENDANCE,
  });
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark, status_changed_to } = payload.body;

  const transaction = await transactionRepository.startTransaction();

  try {
    const leaveRequest =
      await leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found.",
      );

    const manager = leaveRequest.managers.find(
      (manager) => manager.user.user_id === manager_uuid,
    );
    if (!manager)
      throw new BadRequestError(
        "Invalid manager.",
        "User is not a manager of this leave request.",
      );
    manager.setRemark(remark);
    manager.setStatusChangedTo(status_changed_to);

    await manager.save({ transaction });

    leaveRequest.recommend(manager.user);
    await leaveRequest.save({ transaction });
    await transactionRepository.commitTransaction(transaction);

    const organizationUuid = payload.headers["org_uuid"];
    await sendNotification(organizationUuid, {
      send_to: leaveRequest.user.user_id,
      message: {
        type: NotificationType.ENUM.GENERAL,
        text: `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been recommended.`,
      },
    });

    return leaveRequest;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.rejectLeaveRequest = async (payload) => {
  validateBodyParameters({
    payload,
    route: CreateRoute.ENUM.APPROVE_ATTENDANCE,
  });
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark, status_changed_to } = payload.body;

  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest =
      await leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found.",
      );

    const manager = leaveRequest.managers.find(
      (manager) => manager.user.user_id === manager_uuid,
    );
    if (!manager)
      throw new BadRequestError(
        "Invalid manager.",
        "User is not a manager of this leave request.",
      );
    manager.setRemark(remark);
    manager.setStatusChangedTo(status_changed_to);

    await manager.save({ transaction });

    leaveRequest.reject(manager.user);
    await leaveRequest.save({ transaction });
    await transactionRepository.commitTransaction(transaction);

    const organizationUuid = payload.headers["org_uuid"];
    await sendNotification(organizationUuid, {
      send_to: leaveRequest.user.user_id,
      message: {
        type: NotificationType.ENUM.GENERAL,
        text: `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been rejected.`,
      },
    });

    return leaveRequest;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.deleteLeaveRequest = async (payload) => {
  const { leave_request_uuid, user_uuid } = payload.params;
  const user = await userRepository.findOne({ user_id: user_uuid });

  const leaveRequest =
    await leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
  if (!leaveRequest)
    throw new NotFoundError(
      "Leave request not found.",
      "Leave request with provided id not found.",
    );

  leaveRequest.cancel(user);
  return leaveRequest.save();
};

exports.reportLeaveRequest = async (payload) => {
  let { month, leave_type_uuid } = payload.query;

  if (!month) {
    const today = new Date();

    month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  }

  return leaveRequestRepository.listLeaveRequestReport({
    month,
    leave_type_uuid,
  });
};

exports.listEffectiveDays = async (payload) => {
  const { start_date, end_date, leave_type_uuid } = payload.query;
  const user = payload.user;
  const leaveType = await leaveTypeRepository.findOne({
    uuid: leave_type_uuid,
  });

  const diffTime = Math.abs(new Date(end_date) - new Date(start_date));
  const leave_duration = diffTime / (1000 * 60 * 60 * 24) + 1;

  const leaveRequest = {
    user_id: user.id,
    leave_type_id: leaveType.id,
    type: LeaveRequestType.ENUM.FULL_DAY,
    leave_type: leaveType,
    leave_duration: leave_duration,
    start_date: start_date,
    end_date: end_date,
  };

  const startDate = moment(Period.convertDateFromISO(start_date));
  const endDate = moment(Period.convertDateFromISO(end_date));

  let currentStart = startDate.clone();
  let totalEffectiveDays = 0;

  while (currentStart.isSameOrBefore(endDate, "day")) {
    const endOfCurrentMonth = currentStart.clone().endOf("month");

    const chunkEnd = endOfCurrentMonth.isBefore(endDate)
      ? endOfCurrentMonth
      : endDate;

    const chunkEffectiveDays = await simulateApproveLeaves(
      currentStart.clone(),
      chunkEnd.clone(),
      leaveRequest,
    );

    totalEffectiveDays += chunkEffectiveDays;

    currentStart = chunkEnd.clone().add(1, "day");
  }

  return { effective_days: totalEffectiveDays };
};

exports.createAndApproveLeaveRequest = async (payload, transaction) => {
  const {
    leave_type_uuid,
    start_date,
    end_date,
    managers,
    user_uuid,
    documents,
    manager_uuid,
    remark,
    status_changed_to = LeaveRequestStatus.ENUM.APPROVED,
  } = payload.body;

  const leaveType = await leaveTypeRepository.findOne({
    uuid: leave_type_uuid,
  });

  if (!leaveType) {
    throw new NotFoundError(
      "Leave Type not found.",
      "Leave type with provided uuid was not found.",
    );
  }

  if (!leaveType.isActive()) {
    throw new ForbiddenError("Leave Type is currently inactive.");
  }

  const user = await userRepository.findOne({
    user_id: user_uuid,
  });

  if (!user) {
    throw new NotFoundError(
      "User not found.",
      "User associated with this leave request was not found.",
    );
  }

  if (!user.isActive()) {
    throw new ForbiddenError("User is currently inactive.");
  }

  const leaveBalance = await leaveBalanceRepository.findOne({
    user_id: {
      [Op.eq]: user.id,
    },
    leave_type_id: {
      [Op.eq]: leaveType.id,
    },
  });

  if (!leaveBalance) {
    throw new NotFoundError(
      "Leave balance not found.",
      "User does not have any leave balance allotted for this leave type.",
    );
  }

  const leaveDuration = Period.calculateLeaveDuration(start_date, end_date);

  if (
    leaveType.max_consecutive_days &&
    leaveDuration > leaveType.max_consecutive_days
  ) {
    throw new BadRequestError(
      "Leave duration exceeds maximum consecutive days allowed.",
      `The maximum allowed consecutive days for this leave type is ${leaveType.max_consecutive_days}.`,
    );
  }

  if (!managers || managers.length === 0) {
    throw new BadRequestError(
      "No managers found.",
      "Please provide at least one manager to approve this leave request.",
    );
  }

  if (managers.some((manager) => !isValidUUID(manager))) {
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string.",
    );
  }

  if (managers.includes(user_uuid)) {
    throw new BadRequestError(
      "Invalid manager.",
      "User cannot be a manager of his/her own leave request.",
    );
  }

  const leaveRequest = await leaveRequestRepository.createLeaveRequest(
    {
      ...payload.body,
      user_id: user.id,
      leave_type_uuid,
      leave_duration: leaveDuration,
    },
    transaction,
  );

  const newleaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
    leaveRequest.uuid,
    transaction,
  );

  if (documents?.length) {
    const attachmentPayload = documents.map((doc) => ({
      leave_request_id: leaveRequest.id,
      user_document_id: null,
      file_name: doc.file_name,
      file_url: doc.file_url,
      meta_data: doc.meta_data ?? null,
    }));

    await attachmentRepository.bulkCreate(attachmentPayload, { transaction });
  }

  const startDate = Period.toMoment(start_date);
  const endDate = Period.toMoment(end_date);

  let currentStart = startDate.clone();

  while (currentStart.isSameOrBefore(endDate, "day")) {
    const endOfCurrentMonth = currentStart.clone().endOf("month");

    const chunkEnd = endOfCurrentMonth.isBefore(endDate)
      ? endOfCurrentMonth
      : endDate;

    await ApproveLeaves(
      currentStart.clone(),
      chunkEnd.clone(),
      newleaveRequest,
      user_uuid,
      manager_uuid,
      remark,
      status_changed_to,
      transaction,
    );

    currentStart = chunkEnd.clone().add(1, "day");
  }

  return leaveRequest;
};

async function collectAdjacentLeaveContext(
  startDate,
  endDate,
  leaveRequest,
  transaction,
) {
  let upperLimitStartDates = [];
  let lowerLimitEndDates = [];
  let approvedLeaves = [];
  let upperLimitExist = false;
  let lowerLimitExist = false;

  let currStartDate = startDate.clone();
  let currEndDate = endDate.clone();
  let flag = true;

  while (currStartDate.isBefore(currEndDate, "day")) {
    currStartDate = currStartDate.clone().add(1, "day");
    const nextAttendanceForStartDate =
      await attendanceRepository.getAttendanceByCriteria(
        {
          date: currStartDate,
          user_id: leaveRequest.user_id,
          status: {
            [Op.notIn]: [
              AttendanceStatus.ENUM.HALF_DAY,
              AttendanceStatus.ENUM.SHORT_LEAVE,
            ],
          },
        },
        transaction,
      );

    console.log("nextAttendanceForStartDate: ", nextAttendanceForStartDate);
    if (nextAttendanceForStartDate) {
      upperLimitExist = true;
      break;
    }
  }
  currStartDate = startDate.clone();

  while (currEndDate.isAfter(currStartDate, "day")) {
    currEndDate = currEndDate.clone().subtract(1, "day");
    const prevAttendanceForEndDate =
      await attendanceRepository.getAttendanceByCriteria(
        {
          date: currEndDate,
          user_id: leaveRequest.user_id,
          status: {
            [Op.notIn]: [
              AttendanceStatus.ENUM.HALF_DAY,
              AttendanceStatus.ENUM.SHORT_LEAVE,
            ],
          },
        },
        transaction,
      );

    console.log("prevAttendanceForEndDate: ", prevAttendanceForEndDate);
    if (prevAttendanceForEndDate) {
      lowerLimitExist = true;
      break;
    }
  }
  currEndDate = endDate.clone();
  while (flag) {
    currStartDate.subtract(1, "day");

    const clubStartDate = await attendanceRepository.getAttendanceByCriteria(
      {
        date: currStartDate.format("YYYY-MM-DD"),
        user_id: leaveRequest.user_id,
      },
      transaction,
    );

    if (
      clubStartDate &&
      clubStartDate.status != AttendanceStatus.ENUM.PRESENT &&
      clubStartDate.status != AttendanceStatus.ENUM.HALF_DAY &&
      clubStartDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE &&
      clubStartDate.status != AttendanceStatus.ENUM.LATE &&
      clubStartDate.status != AttendanceStatus.ENUM.ABSENT
    ) {
      console.log("clubStartDate: ", clubStartDate);
      if (clubStartDate.leave_type_id == null) {
        upperLimitStartDates.push(clubStartDate);
      } else if (!approvedLeaves.some((obj) => obj.type === "start")) {
        approvedLeaves.push({
          type: "start",
          attendance_id: clubStartDate.id,
          date: clubStartDate.date,
        });
      }
      upperLimitExist = true;
    } else {
      currStartDate.add(1, "day");
      flag = false;
    }
  }

  flag = true;

  while (flag) {
    currEndDate.add(1, "day");

    const clubEndDate = await attendanceRepository.getAttendanceByCriteria(
      {
        date: currEndDate.format("YYYY-MM-DD"),
        user_id: leaveRequest.user_id,
      },
      transaction,
    );
    // console.log("clubEndDate:222 ", clubEndDate);
    if (
      clubEndDate &&
      clubEndDate.status != AttendanceStatus.ENUM.PRESENT &&
      clubEndDate.status != AttendanceStatus.ENUM.HALF_DAY &&
      clubEndDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE &&
      clubEndDate.status != AttendanceStatus.ENUM.LATE &&
      clubEndDate.status != AttendanceStatus.ENUM.ABSENT
    ) {
      // console.log("clubEndDate:3333 ", clubEndDate);
      if (clubEndDate.leave_type_id == null) {
        lowerLimitEndDates.push(clubEndDate);
      } else if (!approvedLeaves.some((obj) => obj.type === "end")) {
        approvedLeaves.push({
          type: "end",
          attendance_id: clubEndDate.id,
          date: clubEndDate.date,
        });
      }
      lowerLimitExist = true;
    } else {
      currEndDate.subtract(1, "day");
      flag = false;
    }
  }

  return {
    upperLimitStartDates,
    lowerLimitEndDates,
    approvedLeaves,
    upperLimitExist,
    lowerLimitExist,
  };
}

async function clubbingApprovedLeaves(
  upperLimitStartDates,
  lowerLimitEndDates,
  leaveRequest,
  upperLimitExist,
  lowerLimitExist,
  attendancePayload,
  transaction,
) {
  console.log(
    "clubUpperLimitExist: ",
    upperLimitStartDates.map((a) => a.get({ plain: true })),
  );
  console.log(
    "clubLowerLimitExist: ",
    lowerLimitEndDates.map((a) => a.get({ plain: true })),
  );
  console.log(
    "leaveRequest.effective_days:before clubbing ",
    leaveRequest.effective_days,
  );
  console.log("upperLimitExist: ", upperLimitExist);
  console.log("lowerLimitExist: ", lowerLimitExist);
  if (upperLimitExist && lowerLimitExist) {
    leaveRequest.effective_days +=
      upperLimitStartDates.length + lowerLimitEndDates.length;

    attendancePayload.push(
      ...upperLimitStartDates.map((attendance) => {
        const { id, uuid, attendance_log, ...plainAttendance } = attendance.get(
          { plain: true },
        );
        return {
          ...plainAttendance,
          leave_type_id: leaveRequest.leave_type_id,
          status: AttendanceStatus.ENUM.ON_LEAVE,
        };
      }),
      ...lowerLimitEndDates.map((attendance) => {
        const { id, uuid, attendance_log, ...plainAttendance } = attendance.get(
          { plain: true },
        );
        return {
          ...plainAttendance,
          leave_type_id: leaveRequest.leave_type_id,
          status: AttendanceStatus.ENUM.ON_LEAVE,
        };
      }),
    );

    console.log("attendancePayload:13 ", attendancePayload);
  }
}

async function collectNetNewLeaveDays(
  startDate,
  endDate,
  leaveRequest,
  attendancePayload,
  transaction,
) {
  let netNewCount = 0;
  let currDate = startDate.clone();

  while (currDate.isSameOrBefore(endDate, "day")) {
    const currAttendance = await attendanceRepository.getAttendanceByCriteria(
      {
        date: currDate.toDate(),
        user_id: leaveRequest.user_id,
      },
      transaction,
    );

    if (currAttendance && currAttendance.leave_type_id == null) {
      const { id, uuid, attendance_log, ...plainAttendance } =
        currAttendance.get({ plain: true });

      attendancePayload.push({
        ...plainAttendance,
        status: AttendanceStatus.ENUM.ON_LEAVE,
        leave_type_id: leaveRequest.leave_type_id,
      });
      netNewCount++;
    } else if (!currAttendance) {
      attendancePayload.push({
        user_id: leaveRequest.user_id,
        date: Period.convertDateFromISO(currDate),
        status: AttendanceStatus.ENUM.ON_LEAVE,
        leave_type_id: leaveRequest.leave_type.id,
      });
      netNewCount++;
    }

    currDate.add(1, "day");
  }

  return { netNewCount };
}

async function sandwichApprovedLeaves(
  startDate,
  endDate,
  leaveRequest,
  upperLimitStartDates,
  lowerLimitEndDates,
  approvedLeaves,
  attendancePayload,
  transaction,
) {
  console.log("startDate: ", startDate);
  console.log("endDate: ", endDate);
  let OutsideSandwichDates = [];

  findSandwichLeavesBefore(
    startDate,
    approvedLeaves,
    upperLimitStartDates,
    OutsideSandwichDates,
  );
  findSandwichLeavesAfter(
    endDate,
    approvedLeaves,
    lowerLimitEndDates,
    OutsideSandwichDates,
  );

  console.log("OutsideSandwichDates: ", OutsideSandwichDates);
  console.log("leaveRequest.effective_days: ", leaveRequest.effective_days);
  leaveRequest.effective_days += OutsideSandwichDates.length;
  console.log("attendancePayload:14 ", attendancePayload);
  attendancePayload.push(
    ...OutsideSandwichDates.map((attendance) => {
      const { id, uuid, attendance_log, ...plainAttendance } = attendance.get({
        plain: true,
      });
      return {
        ...plainAttendance,
        leave_type_id: leaveRequest.leave_type_id,
        status: AttendanceStatus.ENUM.ON_LEAVE,
      };
    }),
  );
}

async function RedefineLeaveDates(
  startDate,
  endDate,
  leaveRequest,
  transaction,
) {
  console.log("startDate: ", startDate);
  console.log("endDate: ", endDate);
  let flag = true;

  while (flag && startDate.isSameOrBefore(endDate)) {
    const startDateAttendance =
      await attendanceRepository.getAttendanceByCriteria(
        {
          date: startDate,
          user_id: leaveRequest.user_id,
          status: {
            [Op.in]: [
              AttendanceStatus.ENUM.HOLIDAY,
              AttendanceStatus.ENUM.ON_LEAVE,
              AttendanceStatus.ENUM.WEEK_OFF,
            ],
          },
        },
        transaction,
      );
    console.log("startDateAttendance: ", startDateAttendance);

    if (startDateAttendance) {
      startDate.add(1, "day");
    } else {
      flag = false;
    }
  }

  console.log("startDate: ", startDate);
  console.log("endDate: 22", endDate);

  flag = true;

  while (flag && startDate.isSameOrBefore(endDate)) {
    const endDateAttendance =
      await attendanceRepository.getAttendanceByCriteria(
        {
          date: endDate,
          user_id: leaveRequest.user_id,
          status: {
            [Op.in]: [
              AttendanceStatus.ENUM.HOLIDAY,
              AttendanceStatus.ENUM.ON_LEAVE,
              AttendanceStatus.ENUM.WEEK_OFF,
            ],
          },
        },
        transaction,
      );

    if (endDateAttendance) {
      endDate.subtract(1, "day");
    } else {
      flag = false;
    }
  }
  if (Period.comparePeriods(endDate, startDate) < 0) {
    return false;
  }
  console.log("startDate: ", startDate);
  console.log("endDate: 33", endDate);

  return true;
}

async function ApproveLeaves(
  start_date,
  end_date,
  leaveRequest,
  user_uuid,
  manager_uuid,
  remark,
  status_changed_to,
  transaction,
) {
  const attendancePayload = [];
  const startDate = start_date;
  console.log("startDate: ", startDate);
  const endDate = end_date;
  console.log("endDate: ", endDate);
  const leaveBalancePeriod = Period.convertPeriodFromDate(startDate);
  console.log("leaveBalancePeriod: ", leaveBalancePeriod);

  const currentMonthPeriod = Period.convertPeriodFromDate(
    Period.getCurrentDate(),
  );
  const user = await userRepository.findOne({ user_id: user_uuid });
  let previousEffectiveDays = 0;
  console.log("leaveRequest.leave_type.id: ", leaveRequest.leave_type.id);

  if (!leaveRequest)
    throw new NotFoundError(
      "Leave request not found.",
      "Leave request with provided id not found.",
    );
  const leaveBalance = await leaveBalanceRepository.getLeaveBalanceByUUIDS({
    user_uuid,
    leave_type_uuid: leaveRequest.leave_type.uuid,
    period: leaveBalancePeriod,
  });

  if (leaveRequest.type == LeaveRequestType.ENUM.FULL_DAY) {
    let upperLimitStartDates = [];
    let lowerLimitEndDates = [];
    let approvedLeaves = [];
    let upperLimitExist = false;
    let lowerLimitExist = false;

    const workingDaysExist = await RedefineLeaveDates(
      startDate,
      endDate,
      leaveRequest,
      transaction,
    );
    leaveRequest.effective_days = 0;
    previousEffectiveDays = leaveRequest.effective_days;

    const clubbingEnabled =
      leaveRequest.leave_type.is_clubbing_enabled &&
      Number(user.clubbing_leave_exception_balance) <= 0;
    console.log(
      "Number(user.clubbing_leave_exception_balance) > 0: ",
      Number(user.clubbing_leave_exception_balance) <= 0,
    );
    console.log(
      " leaveRequest.leave_type.is_clubbing_enabled : ",
      leaveRequest.leave_type.is_clubbing_enabled,
    );

    console.log("clubbingEnabled: ", clubbingEnabled);

    const sandwichEnabled =
      leaveRequest.leave_type.is_sandwich_enabled &&
      Number(user.sandwich_leave_exception_balance) <= 0;

    console.log("sandwichEnabled: ", sandwichEnabled);

    if (workingDaysExist) {
      if (clubbingEnabled || sandwichEnabled) {
        ({
          upperLimitStartDates,
          lowerLimitEndDates,
          approvedLeaves,
          upperLimitExist,
          lowerLimitExist,
        } = await collectAdjacentLeaveContext(
          startDate,
          endDate,
          leaveRequest,
          transaction,
        ));
      }

      const { netNewCount } = await collectNetNewLeaveDays(
        startDate,
        endDate,
        leaveRequest,
        attendancePayload,
        transaction,
      );

      leaveRequest.effective_days += netNewCount;

      if (clubbingEnabled) {
        const attendancePayloadLengthBefore = attendancePayload.length;

        await clubbingApprovedLeaves(
          upperLimitStartDates,
          lowerLimitEndDates,
          leaveRequest,
          upperLimitExist,
          lowerLimitExist,
          attendancePayload,
          transaction,
        );

        const clubbingWasApplied =
          attendancePayload.length > attendancePayloadLengthBefore;

        if (clubbingWasApplied) {
          user.clubbing_leave_exception_balance = Math.max(
            0,
            Number(user.clubbing_leave_exception_balance) - 1,
          );
        }
      }

      if (sandwichEnabled) {
        const attendancePayloadLengthBefore = attendancePayload.length;

        await sandwichApprovedLeaves(
          startDate,
          endDate,
          leaveRequest,
          upperLimitStartDates,
          lowerLimitEndDates,
          approvedLeaves,
          attendancePayload,
          transaction,
        );

        const sandwichWasApplied =
          attendancePayload.length > attendancePayloadLengthBefore;

        if (sandwichWasApplied) {
          user.sandwich_leave_exception_balance = Math.max(
            0,
            Number(user.sandwich_leave_exception_balance) - 1,
          );
        }
      }
    }
  } else {
    const todaysAttendance = await attendanceRepository.getAttendanceByCriteria(
      {
        date: leaveRequest.start_date,
        user_id: leaveRequest.user_id,
        status: {
          [Op.in]: [
            AttendanceStatus.ENUM.HOLIDAY,
            AttendanceStatus.ENUM.ON_LEAVE,
            AttendanceStatus.ENUM.WEEK_OFF,
          ],
        },
      },
      transaction,
    );

    if (!todaysAttendance) {
      leaveRequest.effective_days = leaveRequest.leave_duration;

      attendancePayload.push({
        user_id: leaveRequest.user_id,
        date: startDate,
        status:
          leaveRequest.type == LeaveRequestType.ENUM.HALF_DAY
            ? AttendanceStatus.ENUM.HALF_DAY
            : AttendanceStatus.ENUM.SHORT_LEAVE,
        leave_type_id: leaveRequest.leave_type.id,
      });
    } else {
      attendancePayload.push({
        ...todaysAttendance,
        status:
          leaveRequest.type == LeaveRequestType.ENUM.HALF_DAY
            ? AttendanceStatus.ENUM.HALF_DAY
            : AttendanceStatus.ENUM.SHORT_LEAVE,
      });
    }
  }

  const manager = leaveRequest.managers.find(
    (manager) => manager.user.user_id === manager_uuid,
  );
  if (!manager)
    throw new BadRequestError(
      "Invalid manager.",
      "User is not a manager of this leave request.",
    );
  manager.setRemark(remark);
  manager.setStatusChangedTo(status_changed_to);
  await manager.save({ transaction });

  leaveRequest.approve(manager.user);

  const isToday = startDate.isSame(Period.getCurrentDate(), "day");

  if (isToday && leaveRequest.type === LeaveRequestType.ENUM.FULL_DAY) {
    if (user.past_dated_leave_balance > 0) {
      user.pdlPenality();
    } else {
      leaveRequest.penalty = leaveRequest.effective_days;
    }
  }

  await user.save({ transaction });
  await leaveRequest.save({ transaction });

  console.log("leaveRequest.effective_days: ", leaveRequest.effective_days);
  console.log("leaveBalancePeriod: ", leaveBalancePeriod);
  const leaveBalanceSum =
    (await leaveBalanceRepository.sumLeaveBalancesFromPeriod(
      user_uuid,
      leaveRequest.leave_type.id,
      currentMonthPeriod,
      transaction,
    )) || 0;
  if (leaveBalance) {
    const updatedBalance = await leaveBalance.deductBalanceBy(
      leaveRequest.effective_days +
        Number(leaveRequest.penalty) -
        previousEffectiveDays,
    );

    if (
      !leaveRequest.leave_type.allow_negative_leaves &&
      updatedBalance < 0 &&
      leaveBalanceSum -
        (leaveRequest.effective_days +
          Number(leaveRequest.penalty) -
          previousEffectiveDays) <
        0
    ) {
      throw new BadRequestError(
        "Negative leave balance not allowed.",
        "The leave balance cannot go below zero for this leave type.",
      );
    }

    await leaveBalance.save({ transaction });
  } else {
    if (
      !leaveRequest.leave_type.allow_negative_leaves &&
      leaveBalanceSum -
        (leaveRequest.effective_days +
          Number(leaveRequest.penalty) -
          previousEffectiveDays) <
        0
    ) {
      throw new BadRequestError(
        "Negative leave balance not allowed.",
        "The leave balance cannot go below zero for this leave type.",
      );
    }
    await leaveBalanceRepository.createLeaveBalance(
      {
        user_uuid,
        leave_type_id: leaveRequest.leave_type.id,
        leaves_allocated: 0,
        balance: -Number(leaveRequest.effective_days - previousEffectiveDays),
        period: leaveBalancePeriod,
      },
      transaction,
    );
  }

  console.log("attendancePayload: ", attendancePayload);
  const dedupedPayload = Array.from(
    new Map(
      attendancePayload.map((p) => [`${p.user_id}_${p.date}`, p]),
    ).values(),
  );

  const response = await attendanceRepository.bulkCreateAttendances(
    dedupedPayload,
    transaction,
  );

  const attendanceLogs = response.map((attendance) => {
    return {
      attendance_id: attendance.id,
      remarks: remark ? remark : "Leave Request has been Approved.",
      status: attendance.status
        ? attendance.status
        : AttendanceStatus.ENUM.ON_LEAVE,
      type: AttendanceLogType.ENUM.APPROVED,
      user_id: attendanceLogRepository.getLiteralFrom(
        "user",
        manager_uuid,
        "user_id",
      ),
    };
  });

  await attendanceLogRepository.bulkCreate(attendanceLogs, { transaction });
}

async function simulateApproveLeaves(
  start_date,
  end_date,
  leaveRequest,
  transaction,
) {
  const startDate = start_date.clone();
  const endDate = end_date.clone();

  let effective_days = 0;
  let upperLimitStartDates = [];
  let lowerLimitEndDates = [];
  let approvedLeaves = [];
  let upperLimitExist = false;
  let lowerLimitExist = false;

  const user = await userRepository.findOne({ id: leaveRequest.user_id });

  const workingDaysExist = await RedefineLeaveDates(
    startDate,
    endDate,
    leaveRequest,
    transaction,
  );
  if (!workingDaysExist) {
    return 0;
  }

  const isClubbingApplicable =
    leaveRequest.leave_type.is_clubbing_enabled &&
    !user.clubbing_leave_exception;
  const isSandwichApplicable =
    leaveRequest.leave_type.is_sandwich_enabled &&
    !user.sandwich_leave_exception;
  console.log("user.sandwich_leave_exception: ", user.sandwich_leave_exception);

  console.log("user.clubbing_leave_exception: ", user.clubbing_leave_exception);
  console.log("isSandwichApplicable: ", isSandwichApplicable);
  console.log("isClubbingApplicable: ", isClubbingApplicable);
  if (isClubbingApplicable || isSandwichApplicable) {
    ({
      upperLimitStartDates,
      lowerLimitEndDates,
      approvedLeaves,
      upperLimitExist,
      lowerLimitExist,
    } = await collectAdjacentLeaveContext(
      startDate,
      endDate,
      leaveRequest,
      transaction,
    ));
  }

  const { netNewCount } = await collectNetNewLeaveDays(
    startDate,
    endDate,
    leaveRequest,
    [],
    transaction,
  );

  effective_days += netNewCount;

  if (isClubbingApplicable) {
    if (upperLimitExist && lowerLimitExist) {
      effective_days += upperLimitStartDates.length + lowerLimitEndDates.length;
    }
  }
  if (isSandwichApplicable) {
    let OutsideSandwichDates = [];
    findSandwichLeavesBefore(
      startDate,
      approvedLeaves,
      upperLimitStartDates,
      OutsideSandwichDates,
    );
    findSandwichLeavesAfter(
      endDate,
      approvedLeaves,
      lowerLimitEndDates,
      OutsideSandwichDates,
    );
    effective_days += OutsideSandwichDates.length;
  }

  return effective_days;
}
