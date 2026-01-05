const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/error");
const {
  attendanceLogRepository,
} = require("../repositories/attendance-log-repository");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const { AttendanceLogType } = require("../models/tenants/attendance/enum/attendance-log-type-enum");
const { AttendanceStatus } = require("../models/tenants/attendance/enum/attendance-status-enum");

exports.validateBodyParameters = async (payload) => {
  let { check_in, check_out, attendance_log } = payload.body;

  if (!check_in && check_out)
    throw BadRequestError(
      "check_in and check_out both required or none of them"
    );
  if (attendance_log && !Array.isArray(attendance_log)) {
    payload.body.attendance_log = attendance_log.split(",");
  }
  return payload;
};

exports.recordUserCheckIn = async (payload) => {
  const { user_uuid } = payload.params;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById(user_uuid);
console.log('✌️user --->', user);
  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found"
    );
  if (
    !(
      user.isActive() 
    )
  )
    throw new ForbiddenError("User is currently inactive.");

  const transaction = await transactionRepository.startTransaction();
  try {
    let attendance = await attendanceRepository.getAttendanceByCriteria({
      user_uuid,
      date: new Date(),
    });

    // Helper function to add two time strings (HH:MM:SS format)
    // const addTimes = (time1, time2) => {
    //   const [h1, m1, s1] = time1.split(':').map(Number);
    //   const [h2, m2, s2] = time2.split(':').map(Number);
      
    //   let totalSeconds = (h1 * 3600 + m1 * 60 + s1) + (h2 * 3600 + m2 * 60 + s2);
      
    //   // Handle 24-hour wrap around
    //   totalSeconds = totalSeconds % 86400; // 86400 seconds in 24 hours
      
    //   const hours = Math.floor(totalSeconds / 3600);
    //   const minutes = Math.floor((totalSeconds % 3600) / 60);
    //   const seconds = totalSeconds % 60;
      
    //   return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    // };

    // const currentTime = new Date().toTimeString().split(" ")[0];
    // const latestAllowedCheckIn = addTimes(user.organization_shift.start_time, user.organization_shift.flexible_time);
    // const isLate = currentTime > latestAllowedCheckIn;

    // console.log('✌️Current Time --->', currentTime);
    // console.log('✌️Latest Allowed Check-in Time --->', latestAllowedCheckIn);
    // console.log('✌️isLate --->', isLate);
    if (attendance) {
      if (attendance.isOnLeaveOrHoliday())
        throw new BadRequestError(
          "Check_In not Allowed",
          "Contact your administrator"
        );
      if (attendance.isCheckedIn())
        throw new BadRequestError(
          "Already Checked In",
          "User has already checked in for today"
        );
      else {
        attendance.markCheckIn();
        await attendance.save();
        await attendanceLogRepository.createAttendanceLog(
          {
            attendance_id: attendance.id,
            location,
            type: AttendanceLogType.ENUM.CHECK_IN,
          },
          transaction
        );
        await transactionRepository.commitTransaction(transaction);
        return attendance;
      }
    } else {
      attendance = await attendanceRepository.createAttendance(
        user_uuid,
        transaction
      );
      await attendanceLogRepository.createAttendanceLog(
        {
          attendance_id: attendance[0].id,
          location,
          type: AttendanceLogType.ENUM.CHECK_IN,
        },
        transaction
      );
      await transactionRepository.commitTransaction(transaction);
      return attendance;
    }
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.recordUserCheckOut = async (payload) => {
  const { user_uuid } = payload.params;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById(user_uuid);
  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found"
    );

  if (
    !(
      user.isActive()
    )
  )
    throw new ForbiddenError("User is currently inactive.");

  const attendance = await attendanceRepository.getAttendanceByCriteria({
    user_uuid,
    date: new Date(),
  });
console.log('✌️new Date().toTimeString().split(" ")[0] --->',user.organization_shift.start_time + user.organization_shift. flexible_time );

  if (!attendance)
    throw new NotFoundError(
      "Attendance not found",
      "User attendance for today not found"
    );

  if (!attendance.isCheckedOut())
    throw new BadRequestError(
      "Already Checked Out",
      "User has already checked out for today"
    );

  const transaction = await transactionRepository.startTransaction();

  try {
    await attendanceLogRepository.createAttendanceLog(
      {
        attendance_id: attendance.id,
        location,
        type: AttendanceLogType.ENUM.CHECK_OUT,
      },
      transaction
    );

    attendance.markCheckOut();
    await transactionRepository.commitTransaction(transaction);
    return attendance.save();
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getFilteredAttendance = async (payload) => {
  const {
    user_uuid,
    date,
    date_range,
    organization_role_uuid,
    department_uuid,
    status,
    page = 1,
    limit = 10,
  } = payload.query;
  return attendanceRepository.getFilteredAttendance(
    {
      user_uuid,
      date,
      date_range,
      organization_role_uuid,
      department_uuid,
      status,
    },
    { page, limit }
  );
};

exports.recordAttendance = async (payload) => {
  const { user_uuid, date, check_in, check_out, status } = payload.body;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById(user_uuid);

  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found"
    );
  if (
    !(
      user.isActive() &&
      user.organization.isActive() &&
      user.department.isActive() &&
      user.organization_role?.isActive()
    )
  ) {
    throw new ForbiddenError("User is currently inactive.");
  }
  if (!check_in)
    throw new BadRequestError("Invalid Check In", "Check in time is required");

  const transaction = await transactionRepository.startTransaction();
  try {
    const attendance = await attendanceRepository.recordAttendance(
      { user_uuid, date },
      { check_in, check_out, status },
      transaction
    );

    if (
      status != AttendanceStatus.ENUM.ABSENT ||
      (attendance.isOnLeaveOrHoliday() && (check_in || check_out))
    ) {
      await attendanceLogRepository.recordAttendanceLog(
        {
          attendance_id: attendance[0].id,
          location,
          updates: { check_in, check_out },
        },
        transaction
      );
    }

    await transactionRepository.commitTransaction(transaction);
    return attendance;
  } catch (error) {
    if (!transaction.finished) {
      await transactionRepository.rollbackTransaction(transaction);
    }
    throw error;
  }
};

exports.bulkCreateAttendances = async (payload) => {
  payload = await this.validateBodyParameters(payload);
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;

  const attendanceRecordsPayload = await Promise.all(
    payload.body.map(async (attendance) => {
      const user = await userRepository.getUserById(attendance.user_uuid);
      if (
        !(
          user.isActive() &&
          user.organization.isActive() &&
          user.department.isActive() &&
          user.organization_role?.isActive()
        )
      )
        throw new ForbiddenError("User is currently inactive.");

      const record = {
        user_id: attendanceRepository.getLiteralFrom(
          "user",
          attendance.user_uuid,
          "user_id"
        ),
        check_in: attendance.check_in,
        check_out: attendance.check_out,
        date: attendance.date,
        status: attendance.status,
        affected_hours: attendance.affected_hours,
        attendance_log: [],
      };

      if (attendance.check_in) {
        record.attendance_log.push({
          time: attendance?.check_in,
          type: AttendanceLogType.ENUM.CHECK_IN,
          location,
        });
      }

      if (attendance.check_out) {
        record.attendance_log.push({
          time: attendance?.check_out,
          type: AttendanceLogType.ENUM.CHECK_OUT,
          location,
        });
      }

      if (attendance.attendance_log) {
        record.attendance_log = attendance.attendance_log;
      }

      return record;
    })
  );

  return attendanceRepository.bulkCreateAttendances(attendanceRecordsPayload);
};

exports.getAttendanceByCriteria = async (payload) => {
  const { user_uuid } = payload.params;
  return attendanceRepository.getAttendanceByCriteria({
    user_uuid,
    date: new Date(),
  });
};
