const { NotFoundError, BadRequestError } = require("../middleware/error");
const { isValidDate, isValidUUID } = require("../models/common/validator");
const moment = require('moment-timezone');
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
  if (!leaveType.isActive())
    throw new ForbiddenError("Leave Type is currently inactive.");

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
    const startDate = moment(leaveRequest.start_date).tz('Asia/Kolkata');
    const endDate = moment(leaveRequest.end_date).tz('Asia/Kolkata');
    const attendancePayload = [];

    if (leaveRequest.type == LeaveRequestType.ENUM.FULL_DAY) {
      let upperLimitStartDates = [];
      let lowerLimitEndDates = [];
      let clubUpperLimitExist =false;
            let clubLowerLimitExist =false;

      let sandwichCount = 0;
      let sandwichDates = [];

      let approvedLeaves = [];
      let flag = true;

      while (flag && startDate <= endDate) {
        const startDateAttendance =
          await attendanceRepository.getAttendanceByCriteria({
            date: startDate,
            user_id: leaveRequest.user_id,
            status: {
              [Op.in]: [
                AttendanceStatus.ENUM.HOLIDAY,
                AttendanceStatus.ENUM.ON_LEAVE,
              ],
            },
          });

        if (startDateAttendance) {
          startDate.setDate(startDate.getDate() + 1);
        } else {
          flag = false;
        }
      }

      flag = true;

      while (flag && startDate <= endDate) {
        const endDateAttendance =
          await attendanceRepository.getAttendanceByCriteria({
            date: endDate,
            user_id: leaveRequest.user_id,
            status: {
              [Op.in]: [
                AttendanceStatus.ENUM.HOLIDAY,
                AttendanceStatus.ENUM.ON_LEAVE,
              ],
            },
          });

        if (startDate == endDate) {
          throw new Error("Not every single working day.");
        }

        if (endDateAttendance) {
          endDate.setDate(endDate.getDate() - 1);
        } else {
          flag = false;
        }
      }

      flag = true;

      if (leaveRequest.leave_type.is_clubbing_enabled) {
        let currStartDate = new Date(startDate);
        let currEndDate = new Date(endDate);
        while (flag) {
          currStartDate.setDate(currStartDate.getDate() - 1);

          const clubStartDate =
            await attendanceRepository.getAttendanceByCriteria({
              date: currStartDate,
              user_id: leaveRequest.user_id,
            });

          if (
            clubStartDate &&
            clubStartDate.status != AttendanceStatus.ENUM.PRESENT &&
            clubStartDate.status != AttendanceStatus.ENUM.HALF_DAY &&
            clubStartDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
          ) {
            if (clubStartDate.leave_type_id == null) {
              upperLimitStartDates.push(clubStartDate);
            } else {
              if (!approvedLeaves.some((obj) => obj.type === "start")) {
                approvedLeaves.push({
                  type: "start",
                  attendance_id: clubStartDate.id,
                  date: new Date(clubStartDate.date),
                });
              }
            }
            clubUpperLimitExist=true;
          } else {
            currStartDate.setDate(currStartDate.getDate() + 1);
            flag = false;
          }
        }

        flag = true;

        while (flag) {
          currEndDate.setDate(currEndDate.getDate() + 1);

          const clubEndDate =
            await attendanceRepository.getAttendanceByCriteria({
              date: currEndDate,
              user_id: leaveRequest.user_id,
            });

          if (
            clubEndDate &&
            clubEndDate.status != AttendanceStatus.ENUM.PRESENT &&
            clubEndDate.status != AttendanceStatus.ENUM.HALF_DAY &&
            clubEndDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
          ) {
            if (clubEndDate.leave_type_id == null) {
              lowerLimitEndDates.push(clubEndDate);
            } else {
              if (!approvedLeaves.some((obj) => obj.type === "end")) {
                approvedLeaves.push({
                  type: "end",
                  attendance_id: clubEndDate.id,
                  date: new Date(clubEndDate.date),
                });
              }
            }

            clubLowerLimitExist=true;
          } else {
            currEndDate.setDate(currEndDate.getDate() - 1);
            flag = false;
          }
        }
      }

      if (leaveRequest.leave_type.is_sandwich_enabled) {
        let sandwichCurrDate = new Date(startDate);

        while (sandwichCurrDate <= endDate) {
          const currAttendance =
            await attendanceRepository.getAttendanceByCriteria({
              date: sandwichCurrDate,
              user_id: leaveRequest.user_id,
            });

          if (currAttendance && currAttendance.leave_type_id == null) {
            sandwichDates.push(currAttendance.id);
            sandwichCount++;
          }
          if (!currAttendance) {
            attendancePayload.push({
              user_id: leaveRequest.user_id,
              date: new Date(sandwichCurrDate),
              status: AttendanceStatus.ENUM.ON_LEAVE,
              leave_type_id: leaveRequest.leave_type.id,
            });

            sandwichCount++;
          }

          sandwichCurrDate.setDate(sandwichCurrDate.getDate() + 1);
        }

        leaveRequest.effective_days += sandwichCount;

        await attendanceRepository.update(
          { id: sandwichDates },
          { leave_type_id: leaveRequest.leave_type_id },
          undefined,
          transaction
        );
      }

      if (clubUpperLimitExist && clubLowerLimitExist) {
        leaveRequest.effective_days += upperLimitStartDates.length+ lowerLimitEndDates.length;

        const attendanceIds = [
          ...upperLimitStartDates.map((obj) => obj.id),
          ...lowerLimitEndDates.map((obj) => obj.id),
        ];

        await attendanceRepository.update(
          { id: attendanceIds },
          { leave_type_id: leaveRequest.leave_type_id },
          undefined,
          transaction
        );
      } else {
        if (
          approvedLeaves.some((obj) => obj.type === "start") &&
          upperLimitStartDates.length > 0
        ) {
          let sandwichLeaves = [];
          let leaveObj = approvedLeaves.find((obj) => obj.type === "start");
          let leaveDate = leaveObj ? new Date(leaveObj.date) : null;

          if (leaveDate) {
            let upperLimitStartDate = new Date(leaveDate);
            upperLimitStartDate.setDate(upperLimitStartDate.getDate() + 1);
            while (upperLimitStartDate < startDate) {
              let found = upperLimitStartDates.find((obj) => {
                let objDate = new Date(obj.date);
                return (
                  objDate.getDate() === upperLimitStartDate.getDate() &&
                  objDate.getMonth() === upperLimitStartDate.getMonth() &&
                  objDate.getFullYear() === upperLimitStartDate.getFullYear()
                );
              });

              if (found) {
                sandwichLeaves.push(found.id);
              }
              upperLimitStartDate.setDate(upperLimitStartDate.getDate() + 1);
            }
            leaveRequest.effective_days += sandwichLeaves.length;

            await attendanceRepository.update(
              { id: sandwichLeaves },
              { leave_type_id: leaveRequest.leave_type_id },
              undefined,
              transaction
            );
          }
        }

        if (
          approvedLeaves.some((obj) => obj.type === "end") &&
          lowerLimitEndDates.length > 0
        ) {
          let sandwichLeaves = [];
          let leaveObj = approvedLeaves.find((obj) => obj.type === "end");
          let leaveDate = leaveObj ? new Date(leaveObj.date) : null;

          if (leaveDate) {
            let lowerLimitEndDate = new Date(leaveDate);
            lowerLimitEndDate.setDate(lowerLimitEndDate.getDate() - 1);
            while (lowerLimitEndDate > endDate) {
              let found = lowerLimitEndDates.find((obj) => {
                let objDate = new Date(obj.date);
                return (
                  objDate.getDate() === lowerLimitEndDate.getDate() &&
                  objDate.getMonth() === lowerLimitEndDate.getMonth() &&
                  objDate.getFullYear() === lowerLimitEndDate.getFullYear()
                );
              });

              if (found) {
                sandwichLeaves.push(found.id);
              }
              lowerLimitEndDate.setDate(lowerLimitEndDate.getDate() - 1);
            }
            leaveRequest.effective_days += sandwichLeaves.length;

            await attendanceRepository.update(
              { id: sandwichLeaves },
              { leave_type_id: leaveRequest.leave_type_id },
              undefined,
              transaction
            );
          }
        }
      }
    } else {
      leaveRequest.effective_days = leaveRequest.leave_duration;
    }

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

    const updatedBalance = await leaveRequest.leave_balance.deductBalanceBy(
      leaveRequest.effective_days
    );

    if (!leaveRequest.leave_type.allow_negative_leaves && updatedBalance < 0) {
      throw new BadRequestError(
        "Negative leave balance not allowed.",
        "The leave balance cannot go below zero for this leave type."
      );
    }

    await leaveRequest.leave_balance.save({ transaction });
    await attendanceRepository.bulkCreateAttendances(
      attendancePayload,
      transaction
    );

    await transactionRepository.commitTransaction(transaction);
    return response;
  } catch (error) {
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
      "Manager uuid is required."
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string."
    );

  const transaction = await transactionRepository.startTransaction();

  try {
    const leaveRequest =
      await leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
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
    manager.setStatusChangedTo(status_changed_to);

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
  const { manager_uuid, remark, status_changed_to } = payload.body;

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
    const leaveRequest =
      await leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
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
    manager.setStatusChangedTo(status_changed_to);

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

  const leaveRequest =
    await leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
  if (!leaveRequest)
    throw new NotFoundError(
      "Leave request not found.",
      "Leave request with provided id not found."
    );

  leaveRequest.cancel(user);
  return leaveRequest.save();
};

async function clubbingApprovedLeaves(
  startDate,
  endDate,
  upperLimitStartDates,
  lowerLimitEndDates,
  approvedLeaves,
  leaveRequest,
  transaction
) {
  let clubUpperLimitExist = false;
  let clubLowerLimitExist = false;

  let currStartDate = new Date(startDate);
  let currEndDate = new Date(endDate);
  let flag = true;
  while (flag) {
    currStartDate.setDate(currStartDate.getDate() - 1);

    const clubStartDate = await attendanceRepository.getAttendanceByCriteria({
      date: currStartDate,
      user_id: leaveRequest.user_id,
    });

    if (
      clubStartDate &&
      clubStartDate.status != AttendanceStatus.ENUM.PRESENT &&
      clubStartDate.status != AttendanceStatus.ENUM.HALF_DAY &&
      clubStartDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
    ) {
      if (clubStartDate.leave_type_id == null) {
        upperLimitStartDates.push(clubStartDate);
      } else {
        if (!approvedLeaves.some((obj) => obj.type === "start")) {
          approvedLeaves.push({
            type: "start",
            attendance_id: clubStartDate.id,
            date: new Date(clubStartDate.date),
          });
        }
      }
      clubUpperLimitExist = true;
    } else {
      currStartDate.setDate(currStartDate.getDate() + 1);
      flag = false;
    }
  }

  flag = true;

  while (flag) {
    currEndDate.setDate(currEndDate.getDate() + 1);

    const clubEndDate = await attendanceRepository.getAttendanceByCriteria({
      date: currEndDate,
      user_id: leaveRequest.user_id,
    });

    if (
      clubEndDate &&
      clubEndDate.status != AttendanceStatus.ENUM.PRESENT &&
      clubEndDate.status != AttendanceStatus.ENUM.HALF_DAY &&
      clubEndDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
    ) {
      if (clubEndDate.leave_type_id == null) {
        lowerLimitEndDates.push(clubEndDate);
      } else {
        if (!approvedLeaves.some((obj) => obj.type === "end")) {
          approvedLeaves.push({
            type: "end",
            attendance_id: clubEndDate.id,
            date: new Date(clubEndDate.date),
          });
        }
      }

      clubLowerLimitExist = true;
    } else {
      currEndDate.setDate(currEndDate.getDate() - 1);
      flag = false;
    }
  }

  if (clubUpperLimitExist && clubLowerLimitExist) {
    leaveRequest.effective_days +=
      upperLimitStartDates.length + lowerLimitEndDates.length;

    const attendanceIds = [
      ...upperLimitStartDates.map((obj) => obj.id),
      ...lowerLimitEndDates.map((obj) => obj.id),
    ];
    if (leaveRequest.leave_type.is_clubbing_enabled) {
      let currStartDate = new Date(startDate);
      let currEndDate = new Date(endDate);
      while (flag) {
        currStartDate.setDate(currStartDate.getDate() - 1);

        const clubStartDate =
          await attendanceRepository.getAttendanceByCriteria({
            date: currStartDate,
            user_id: leaveRequest.user_id,
          });

        if (
          clubStartDate &&
          clubStartDate.status != AttendanceStatus.ENUM.PRESENT &&
          clubStartDate.status != AttendanceStatus.ENUM.HALF_DAY &&
          clubStartDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
        ) {
          if (clubStartDate.leave_type_id == null) {
            upperLimitStartDates.push(clubStartDate);
          } else {
            if (!approvedLeaves.some((obj) => obj.type === "start")) {
              approvedLeaves.push({
                type: "start",
                attendance_id: clubStartDate.id,
                date: new Date(clubStartDate.date),
              });
            }
          }
          clubUpperLimitExist = true;
        } else {
          currStartDate.setDate(currStartDate.getDate() + 1);
          flag = false;
        }
      }

      flag = true;
      if (leaveRequest.leave_type.is_clubbing_enabled) {
        let currStartDate = new Date(startDate);
        let currEndDate = new Date(endDate);
        while (flag) {
          currStartDate.setDate(currStartDate.getDate() - 1);

          const clubStartDate =
            await attendanceRepository.getAttendanceByCriteria({
              date: currStartDate,
              user_id: leaveRequest.user_id,
            });

          if (
            clubStartDate &&
            clubStartDate.status != AttendanceStatus.ENUM.PRESENT &&
            clubStartDate.status != AttendanceStatus.ENUM.HALF_DAY &&
            clubStartDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
          ) {
            if (clubStartDate.leave_type_id == null) {
              upperLimitStartDates.push(clubStartDate);
            } else {
              if (!approvedLeaves.some((obj) => obj.type === "start")) {
                approvedLeaves.push({
                  type: "start",
                  attendance_id: clubStartDate.id,
                  date: new Date(clubStartDate.date),
                });
              }
            }
            clubUpperLimitExist = true;
          } else {
            currStartDate.setDate(currStartDate.getDate() + 1);
            flag = false;
          }
        }

        flag = true;

        while (flag) {
          currEndDate.setDate(currEndDate.getDate() + 1);

          const clubEndDate =
            await attendanceRepository.getAttendanceByCriteria({
              date: currEndDate,
              user_id: leaveRequest.user_id,
            });

          if (
            clubEndDate &&
            clubEndDate.status != AttendanceStatus.ENUM.PRESENT &&
            clubEndDate.status != AttendanceStatus.ENUM.HALF_DAY &&
            clubEndDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
          ) {
            if (clubEndDate.leave_type_id == null) {
              lowerLimitEndDates.push(clubEndDate);
            } else {
              if (!approvedLeaves.some((obj) => obj.type === "end")) {
                approvedLeaves.push({
                  type: "end",
                  attendance_id: clubEndDate.id,
                  date: new Date(clubEndDate.date),
                });
              }
            }

            clubLowerLimitExist = true;
          } else {
            currEndDate.setDate(currEndDate.getDate() - 1);
            flag = false;
          }
        }

        if (clubUpperLimitExist && clubLowerLimitExist) {
          leaveRequest.effective_days +=
            upperLimitStartDates.length + lowerLimitEndDates.length;

          const attendanceIds = [
            ...upperLimitStartDates.map((obj) => obj.id),
            ...lowerLimitEndDates.map((obj) => obj.id),
          ];

          await attendanceRepository.update(
            { id: attendanceIds },
            { leave_type_id: leaveRequest.leave_type_id },
            undefined,
            transaction
          );
        }
      }

      while (flag) {
        currEndDate.setDate(currEndDate.getDate() + 1);

        const clubEndDate = await attendanceRepository.getAttendanceByCriteria({
          date: currEndDate,
          user_id: leaveRequest.user_id,
        });

        if (
          clubEndDate &&
          clubEndDate.status != AttendanceStatus.ENUM.PRESENT &&
          clubEndDate.status != AttendanceStatus.ENUM.HALF_DAY &&
          clubEndDate.status != AttendanceStatus.ENUM.EARLY_DEPARTURE
        ) {
          if (clubEndDate.leave_type_id == null) {
            lowerLimitEndDates.push(clubEndDate);
          } else {
            if (!approvedLeaves.some((obj) => obj.type === "end")) {
              approvedLeaves.push({
                type: "end",
                attendance_id: clubEndDate.id,
                date: new Date(clubEndDate.date),
              });
            }
          }

          clubLowerLimitExist = true;
        } else {
          currEndDate.setDate(currEndDate.getDate() - 1);
          flag = false;
        }
      }

      if (clubUpperLimitExist && clubLowerLimitExist) {
        leaveRequest.effective_days +=
          upperLimitStartDates.length + lowerLimitEndDates.length;

        const attendanceIds = [
          ...upperLimitStartDates.map((obj) => obj.id),
          ...lowerLimitEndDates.map((obj) => obj.id),
        ];

        await attendanceRepository.update(
          { id: attendanceIds },
          { leave_type_id: leaveRequest.leave_type_id },
          undefined,
          transaction
        );
      }
    }
    await attendanceRepository.update(
      { id: attendanceIds },
      { leave_type_id: leaveRequest.leave_type_id },
      undefined,
      transaction
    );
  }
}

async function sandwichApprovedLeaves(
  startDate,
  endDate,
  leaveRequest,
  attendancePayload,
  upperLimitStartDates,
  lowerLimitEndDates,
  approvedLeaves,
  transaction
) {
  let sandwichCount = 0;
  let sandwichDates = [];
  let OutsideSandwichDates = [];
  let sandwichCurrDate = new Date(startDate);

  while (sandwichCurrDate <= endDate) {
    const currAttendance = await attendanceRepository.getAttendanceByCriteria({
      date: sandwichCurrDate,
      user_id: leaveRequest.user_id,
    });

    if (currAttendance && currAttendance.leave_type_id == null) {
      sandwichDates.push(currAttendance.id);
      sandwichCount++;
    }
    if (!currAttendance) {
      attendancePayload.push({
        user_id: leaveRequest.user_id,
        date: new Date(sandwichCurrDate),
        status: AttendanceStatus.ENUM.ON_LEAVE,
        leave_type_id: leaveRequest.leave_type.id,
      });

      sandwichCount++;
    }

    sandwichCurrDate.setDate(sandwichCurrDate.getDate() + 1);
  }

  findSandwichLeavesBefore(
    startDate,
    approvedLeaves,
    upperLimitStartDates,
    OutsideSandwichDates
  );
  findSandwichLeavesAfter(
    endDate,
    approvedLeaves,
    lowerLimitEndDates,
    OutsideSandwichDates
  );

  leaveRequest.effective_days += sandwichCount + OutsideSandwichDates.length;

  await attendanceRepository.update(
    { id: [...sandwichDates, ...OutsideSandwichDates] },
    { leave_type_id: leaveRequest.leave_type_id },
    undefined,
    transaction
  );
}

async function RedefineLeaveDates(startDate, endDate, leaveRequest) {
  let flag = true;

  while (flag && startDate <= endDate) {
    const startDateAttendance =
      await attendanceRepository.getAttendanceByCriteria({
        date: startDate,
        user_id: leaveRequest.user_id,
        status: {
          [Op.in]: [
            AttendanceStatus.ENUM.HOLIDAY,
            AttendanceStatus.ENUM.ON_LEAVE,
          ],
        },
      });

    if (startDateAttendance) {
      startDate.setDate(startDate.getDate() + 1);
    } else {
      flag = false;
    }
  }

  flag = true;

  while (flag && startDate <= endDate) {
    const endDateAttendance =
      await attendanceRepository.getAttendanceByCriteria({
        date: endDate,
        user_id: leaveRequest.user_id,
        status: {
          [Op.in]: [
            AttendanceStatus.ENUM.HOLIDAY,
            AttendanceStatus.ENUM.ON_LEAVE,
          ],
        },
      });

    if (startDate == endDate) {
      throw new Error("Not every single working day.");
    }

    if (endDateAttendance) {
      endDate.setDate(endDate.getDate() - 1);
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
  transaction
) {
  const attendancePayload = [];
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const leaveBalancePeriod = `${startDate.getFullYear()}-${String(
    startDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const leaveBalance = await leaveBalanceRepository.getLeaveBalancesOfUser(
    user_uuid,
    leaveBalancePeriod
  );

  if (leaveRequest.type == LeaveRequestType.ENUM.FULL_DAY) {
    let upperLimitStartDates = [];
    let lowerLimitEndDates = [];
    let approvedLeaves = [];

    RedefineLeaveDates(startDate, endDate, leaveRequest);

    if (leaveRequest.leave_type.is_clubbing_enabled) {
      await clubbingApprovedLeaves(
        startDate,
        endDate,
        upperLimitStartDates,
        lowerLimitEndDates,
        approvedLeaves,
        leaveRequest,
        transaction
      );
    }
    if (leaveRequest.leave_type.is_sandwich_enabled) {
      await sandwichApprovedLeaves(
        startDate,
        endDate,
        leaveRequest,
        attendancePayload,
        upperLimitStartDates,
        lowerLimitEndDates,
        approvedLeaves,
        transaction
      );
    } else {
      const nonWorkingDays = await attendanceRepository.findAll({
        date: { [Op.between]: [startDate, endDate] },
        user_id: leaveRequest.user_id,
        leave_type_id: { [Op.not]: null },
      });

      const totalDays =
        Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      leaveRequest.effective_days += totalDays - nonWorkingDays.length;

      await attendanceRepository.update(
        {
          date: { [Op.between]: [startDate, endDate] },
          user_id: leaveRequest.user_id,
          leave_type_id: { [Op.is]: null },
        },
        { leave_type_id: leaveRequest.leave_type_id },
        undefined,
        transaction
      );
    }
  } else {
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
  manager.setStatusChangedTo(status_changed_to);
  await manager.save({ transaction });

  await leaveRequest.approve(manager.user);

  await leaveRequest.save({ transaction });

  if (leaveBalance) {
    const updatedBalance = await leaveBalance.deductBalanceBy(
      leaveRequest.effective_days
    );

    if (!leaveRequest.leave_type.allow_negative_leaves && updatedBalance < 0) {
      throw new BadRequestError(
        "Negative leave balance not allowed.",
        "The leave balance cannot go below zero for this leave type."
      );
    }

    await leaveBalance.save({ transaction });
  } else {
    await leaveBalanceRepository.createLeaveBalance(
      {
        user_uuid,
        leave_type_id: leaveRequest.leave_type.id,
        leaves_allocated: 0,
        balance: leaveRequest.effective_days,
        period: leaveBalancePeriod,
      },
      transaction
    );
  }

  await attendanceRepository.bulkCreateAttendances(
    attendancePayload,
    transaction
  );
}
