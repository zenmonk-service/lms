const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/error");
const { isValidDate, isValidUUID } = require("../models/common/validator");
const moment = require("moment-timezone");
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
const { getSchema } = require("../lib/schema");
const { sendNotification } = require("./notification-service");

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
      "Date parameter is not a valid date string.",
    );
  if (date) payload.query.date = new Date(date);

  if (start_date && !isValidDate(start_date))
    throw new BadRequestError(
      "Invalid start date.",
      "Start date parameter is not a valid date string.",
    );
  if (start_date) payload.query.start_date = new Date(start_date);
  else payload.query.start_date = new Date(new Date().getFullYear(), 0, 1);

  if (end_date && !isValidDate(end_date))
    throw new BadRequestError(
      "Invalid end date.",
      "End date parameter is not a valid date string.",
    );
  if (end_date) payload.query.end_date = new Date(end_date);
  else payload.query.end_date = new Date(+new Date().getFullYear() + 1, 0, 1);

  if (date_range && !Array.isArray(date_range) && date_range.length != 2)
    throw new BadRequestError(
      "Invalid date_range.",
      "Date range must include start date and end date.",
    );
  if (user_uuid && !isValidUUID(user_uuid))
    throw new BadRequestError(
      "Invalid user uuid.",
      "User uuid is not a valid uuid string.",
    );

  if (leave_type_uuid && !isValidUUID(leave_type_uuid))
    throw new BadRequestError(
      "Invalid leave type uuid.",
      "Leave type uuid is not a valid uuid string.",
    );

  if (manager_uuid && !isValidUUID(manager_uuid))
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string.",
    );

  if (status && !LeaveRequestStatus.isValidValue(status))
    throw new BadRequestError(
      "Invalid status.",
      "Status parameter is not a valid status string.",
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
    search,
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
    },
    { archive, page, limit },
  );
};

exports.createLeaveRequest = async (payload) => {
  const leaveType = await leaveTypeRepository.findOne({
    uuid: payload.body.leave_type_uuid,
  });
  if (leaveType && !leaveType.isActive())
    throw new ForbiddenError("Leave Type is currently inactive.");

  const user = await userRepository.findOne({
    user_id: payload.body.user_uuid,
  });

  if (user && !user.isActive())
    throw new ForbiddenError("User is currently inactive.");

  const leaveTypeId = await leaveRequestRepository.getLiteralFrom(
    "leave_type",
    payload.body.leave_type_uuid,
    "uuid",
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
      "User do not have any leave balance alloted from this type.",
    );

  let leaveDuration = await leaveRequestRepository.model.calculateLeaveDuration(
    payload.body,
  );
  if (
    leaveType.max_consecutive_days &&
    leaveDuration > leaveType.max_consecutive_days
  ) {
    throw new BadRequestError(
      "Leave duration exceeds maximum consecutive days allowed.",
      `The maximum allowed consecutive days for this leave type is ${leaveType.max_consecutive_days}.`,
    );
  }

  payload.body.leave_duration = leaveDuration;

  if (!payload.body.managers || payload.body.managers?.length === 0)
    throw new BadRequestError(
      "No managers found.",
      "Please provide at least one manager to approve this leave request.",
    );
  if (payload.body.managers?.some((manager) => !isValidUUID(manager)))
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string.",
    );
  if (
    payload.body.managers?.find((manager) => manager === payload.body.user_uuid)
  )
    throw new BadRequestError(
      "Invalid manager.",
      "User cannot be a manager of his/her own leave request.",
    );

  const leaveRequest = await leaveRequestRepository.createLeaveRequest({
    ...payload.body,
    user_id: user.id,
    leave_type_id: leaveTypeId,
  });

  const organizationUuid = getSchema().split("_")[1];
  await sendNotification(organizationUuid, {
    send_to: payload.body.managers,
    message: "A leave request has been created.",
  });

  return leaveRequest;
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
      transaction,
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found.",
      );

    if (!leaveRequest.isPending())
      throw new BadRequestError(
        "Invalid leave request status.",
        "Leave request is not in pending status. Only pending leave requests can be updated.",
      );
    const userId = await leaveRequestRepository.getLiteralFrom(
      "user",
      payload.body.user_uuid,
      "user_id",
    );
    const leaveTypeId = await leaveRequestRepository.getLiteralFrom(
      "leave_type",
      payload.body.leave_type_uuid,
      "uuid",
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
        "User do not have any leave balance alloted from this type.",
      );
    const leaveDuration =
      await leaveRequestRepository.model.calculateLeaveDuration(payload.body);

    if (leaveDuration > leaveBalance.balance)
      throw new BadRequestError(
        "Insufficient leave balance.",
        "User do not have enough leave balance to apply for this leave request.",
      );

    if (!payload.body.managers || payload.body.managers?.length === 0)
      throw new BadRequestError(
        "No managers found.",
        "Please provide at least one manager to approve this leave request.",
      );
    if (payload.body.managers?.some((manager) => !isValidUUID(manager)))
      throw new BadRequestError(
        "Invalid manager uuid.",
        "Manager uuid is not a valid uuid string.",
      );

    if (
      payload.body.managers?.find(
        (manager) => manager === payload.body.user_uuid,
      )
    )
      throw new BadRequestError(
        "Invalid manager.",
        "User cannot be a manager of his/her own leave request.",
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
          "user_id",
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
      transaction,
    );
    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.approveLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark, status_changed_to, user_uuid } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required.",
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string.",
    );

  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid,

      transaction,
    );

    const startDate = moment(leaveRequest.start_date).tz("Asia/Kolkata");
    const endDate = moment(leaveRequest.end_date).tz("Asia/Kolkata");

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

    const organizationUuid = getSchema().split("_")[1];
    await sendNotification(organizationUuid, {
      send_to: payload.body.user_uuid,
      message: "Your leave request has been approved.",
    });
  } catch (error) {
    console.log("error: ", error);
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.recommendLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark, status_changed_to } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required.",
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string.",
    );

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

    const organizationUuid = getSchema().split("_")[1];
    await sendNotification(organizationUuid, {
      send_to: leaveRequest.user.user_id,
      message: "Your leave request has been recommended.",
    });

    return leaveRequest;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.rejectLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark, status_changed_to } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required.",
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string.",
    );

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

    const organizationUuid = getSchema().split("_")[1];
    await sendNotification(organizationUuid, {
      send_to: leaveRequest.user.user_id,
      message: "Your leave request has been rejected.",
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

  const nextAttendanceForStartDate =
    await attendanceRepository.getAttendanceByCriteria(
      {
        date: startDate.clone().add(1, "day").format("YYYY-MM-DD"),
        user_id: leaveRequest.user_id,
      },
      transaction,
    );

  if (nextAttendanceForStartDate) {
    lowerLimitExist = true;
  }

  const prevAttendanceForEndDate =
    await attendanceRepository.getAttendanceByCriteria(
      {
        date: endDate.clone().subtract(1, "day").format("YYYY-MM-DD"),
        user_id: leaveRequest.user_id,
      },
      transaction,
    );

  if (prevAttendanceForEndDate) {
    upperLimitExist = true;
  }

  while (flag) {
    currStartDate.subtract(1, "day");

    const clubStartDate = await attendanceRepository.getAttendanceByCriteria(
      {
        date: currStartDate.format("YYYY-MM-DD"),
        user_id: leaveRequest.user_id,
      },
      transaction,
    );
    console.log("clubStartDate: ", clubStartDate);

    if (
      clubStartDate &&
      clubStartDate.status != AttendanceStatus.ENUM.PRESENT &&
      clubStartDate.status != AttendanceStatus.ENUM.HALF_DAY &&
      clubStartDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
    ) {
      if (clubStartDate.leave_type_id == null) {
        upperLimitStartDates.push(clubStartDate);
      } else if (!approvedLeaves.some((obj) => obj.type === "start")) {
        approvedLeaves.push({
          type: "start",
          attendance_id: clubStartDate.id,
          date: moment(clubStartDate.date).tz("Asia/Kolkata"),
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

    if (
      clubEndDate &&
      clubEndDate.status != AttendanceStatus.ENUM.PRESENT &&
      clubEndDate.status != AttendanceStatus.ENUM.HALF_DAY &&
      clubEndDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
    ) {
      if (clubEndDate.leave_type_id == null) {
        lowerLimitEndDates.push(clubEndDate);
      } else if (!approvedLeaves.some((obj) => obj.type === "end")) {
        approvedLeaves.push({
          type: "end",
          attendance_id: clubEndDate.id,
          date: moment(clubEndDate.date).tz("Asia/Kolkata"),
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

    const attendanceIds = [
      ...upperLimitStartDates.map((obj) => obj.id),
      ...lowerLimitEndDates.map((obj) => obj.id),
    ];
    console.log(
      "leaveRequest.effective_days: after clubbing",
      leaveRequest.effective_days,
    );

    await attendanceRepository.update(
      { id: attendanceIds },
      { leave_type_id: leaveRequest.leave_type_id },
      undefined,
      transaction,
    );
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
  const attendanceIdsToUpdate = [];
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
      attendanceIdsToUpdate.push(currAttendance.id);
      netNewCount++;
    } else if (!currAttendance) {
      attendancePayload.push({
        user_id: leaveRequest.user_id,
        date: currDate.toDate(),
        status: AttendanceStatus.ENUM.ON_LEAVE,
        leave_type_id: leaveRequest.leave_type.id,
      });

      netNewCount++;
    }

    currDate.add(1, "day");
  }

  return { netNewCount, attendanceIdsToUpdate };
}

async function sandwichApprovedLeaves(
  startDate,
  endDate,
  leaveRequest,
  upperLimitStartDates,
  lowerLimitEndDates,
  approvedLeaves,
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

  await attendanceRepository.update(
    { id: OutsideSandwichDates },
    { leave_type_id: leaveRequest.leave_type_id },
    undefined,
    transaction,
  );
}

async function RedefineLeaveDates(
  startDate,
  endDate,
  leaveRequest,
  transaction,
) {
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
            ],
          },
        },
        transaction,
      );

    if (startDateAttendance) {
      startDate.add(1, "day");
    } else {
      flag = false;
    }
  }

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
            ],
          },
        },
        transaction,
      );

    if (startDate == endDate) {
      throw new Error("Not every single working day.");
    }

    if (endDateAttendance) {
      endDate.subtract(1, "day");
    } else {
      flag = false;
    }
  }
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
  const endDate = end_date;
  const leaveBalancePeriod = `${startDate.year()}-${String(
    startDate.month() + 1,
  ).padStart(2, "0")}`;
  const currentDate = moment();

  const currentMonthPeriod = `${currentDate.year()}-${String(
    currentDate.month() + 1,
  ).padStart(2, "0")}`;
  let previousEffectiveDays = 0;
  console.log("leaveRequest.leave_type.id: ", leaveRequest.leave_type.id);
  const leaveBalance = await leaveBalanceRepository.getLeaveBalancesOfUser(
    user_uuid,
    leaveRequest.leave_type.id,
    leaveBalancePeriod,
  );
  // console.log("leaveBalance: ", leaveBalance);

  if (leaveRequest.type == LeaveRequestType.ENUM.FULL_DAY) {
    let upperLimitStartDates = [];
    let lowerLimitEndDates = [];
    let approvedLeaves = [];
    let upperLimitExist = false;
    let lowerLimitExist = false;

    await RedefineLeaveDates(startDate, endDate, leaveRequest, transaction);

    if (
      leaveRequest.leave_type.is_clubbing_enabled ||
      leaveRequest.leave_type.is_sandwich_enabled
    ) {
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

    previousEffectiveDays = leaveRequest.effective_days ?? 0;

    const { netNewCount, attendanceIdsToUpdate } = await collectNetNewLeaveDays(
      startDate,
      endDate,
      leaveRequest,
      attendancePayload,
      transaction,
    );

    leaveRequest.effective_days += netNewCount;

    if (attendanceIdsToUpdate.length > 0) {
      await attendanceRepository.update(
        { id: attendanceIdsToUpdate },
        { leave_type_id: leaveRequest.leave_type_id },
        undefined,
        transaction,
      );
    }

    if (leaveRequest.leave_type.is_clubbing_enabled) {
      await clubbingApprovedLeaves(
        upperLimitStartDates,
        lowerLimitEndDates,
        leaveRequest,
        upperLimitExist,
        lowerLimitExist,
        transaction,
      );
    }
    if (leaveRequest.leave_type.is_sandwich_enabled) {
      await sandwichApprovedLeaves(
        startDate,
        endDate,
        leaveRequest,
        upperLimitStartDates,
        lowerLimitEndDates,
        approvedLeaves,
        transaction,
      );
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

      if (leaveRequest.type == LeaveRequestType.ENUM.HALF_DAY) {
        attendancePayload.push({
          user_id: leaveRequest.user_id,
          date: startDate,
          status: AttendanceStatus.ENUM.HALF_DAY,
          leave_type_id: leaveRequest.leave_type.id,
        });
      } else {
        attendancePayload.push({
          user_id: leaveRequest.user_id,
          date: startDate,
          status: AttendanceStatus.ENUM.EARLY_DEPARTURE,
          leave_type_id: leaveRequest.leave_type.id,
        });
      }
    }
  }

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

  await leaveRequest.approve(manager.user);

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
      leaveRequest.effective_days - previousEffectiveDays,
    );

    if (
      !leaveRequest.leave_type.allow_negative_leaves &&
      updatedBalance < 0 &&
      leaveBalanceSum - (leaveRequest.effective_days - previousEffectiveDays) <
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
      leaveBalanceSum - (leaveRequest.effective_days - previousEffectiveDays) <
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
  await attendanceRepository.bulkCreateAttendances(
    attendancePayload,
    transaction,
  );
}
