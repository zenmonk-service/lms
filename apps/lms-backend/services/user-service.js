const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} = require("../middleware/error");
const {
  publicUserRepository,
} = require("../repositories/public-user-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  userDocumentRepository,
} = require("../repositories/user-document-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");

const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const { allocateLeaveBalance } = require("./leave-type-service");
const { Op } = require("sequelize");
const {
  organizationUserRepository,
} = require("../repositories/organization-user-repository");
const {
  organizationRepository,
} = require("../repositories/organization-repository");
const { shiftRepository } = require("../repositories/shift-repository");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");
const {
  userPersonalInformationRepository,
} = require("../repositories/user-personal-information-repository");
const { validateBodyParameters } = require("../lib/validate-body-paramenters");
const {
  AttendanceLogType,
} = require("../models/tenants/attendance/enum/attendance-log-type-enum");
const { CreateRoute } = require("./enum/create-routes-enum");
const {
  EmployeeIdMode,
} = require("../models/tenants/organization/enum/employee-id-mode-enum");
const Period = require("../lib/period");
const { generateWeekOffAttendancePayload } = require("../cron-jobs/weekoffs");
const {
  attendanceLogRepository,
} = require("../repositories/attendance-log-repository");
const {
  attachmentRepository,
} = require("../repositories/attachment-repository");

exports.createUser = async (payload) => {
  validateBodyParameters({
    payload,
    route: CreateRoute.ENUM.CREATE_USER,
  });
  const organizationUuid = payload.headers["org_uuid"];
  const { role_uuid, shift_uuid, email, name, password, role } = payload.body;
  const transaction = await transactionRepository.startTransaction();

  try {
    const organization_id = await publicUserRepository.getLiteralFrom(
      "organization",
      organizationUuid,
      "uuid",
    );
    if (!organization_id) {
      throw new Error(`Organization with uuid ${organizationUuid} not found`);
    }

    let user = await publicUserRepository.findOne({
      email,
    });

    if (!user) {
      user = await publicUserRepository.create(
        {
          email,
          name,
          password,
          role,
        },
        { transaction },
      );
    }
    const organizationUser = await organizationUserRepository.findOne({
      organization_id: { [Op.eq]: organization_id },
      user_id: { [Op.eq]: user.id },
    });
    if (!organizationUser) {
      await organizationUserRepository.create(
        { organization_id, user_id: user.id },
        { transaction },
      );
    } else {
      throw new ConflictError("User already exists in Organization.");
    }

    const organizationSettings = await organizationSettingRepository.findAll();
    user = await userRepository.create(
      {
        ...payload.body,
        role_id: userRepository.getLiteralFrom("role", role_uuid, "uuid"),
        shift_id: shift_uuid
          ? shiftRepository.getLiteralFrom(
              "organization_shift",
              shift_uuid,
              "uuid",
            )
          : null,
        user_id: user.user_id,
        past_dated_leave_balance:
          organizationSettings[0]?.past_dated_leave?.balance || null,
        sandwich_leave_exception:
          organizationSettings[0]?.sandwich_leave_exception?.roles?.includes(
            role_uuid,
          ) ?? false,
        clubbing_leave_exception:
          organizationSettings[0]?.clubbing_leave_exception?.roles?.includes(
            role_uuid,
          ) ?? false,
      },
      { transaction },
    );

    const leaveTypes = await leaveTypeRepository.getFilteredLeaveTypes(
      { role_uuid },
      {},
    );
    const leaveBalancesPayload = (
      await Promise.all(
        leaveTypes.rows.map((leaveType) =>
          allocateLeaveBalance([user], leaveType),
        ),
      )
    ).flat();

    await leaveBalanceRepository.bulkCreate(leaveBalancesPayload, {
      transaction,
    });

    const today = Period.getCurrentDate();
    const attendanceDates = await attendanceRepository.findAll(
      { status: AttendanceStatus.ENUM.HOLIDAY, date: { [Op.gte]: today } },
      [],
      true,
      ["date"],
      undefined,
      { group: ["date"], order: [["date", "ASC"]] },
    );

    const attendancePayload = attendanceDates.map((attendance) => {
      return {
        date: attendance.date,
        user_id: user.id,
        status: AttendanceStatus.ENUM.HOLIDAY,
      };
    });

    const workingDays = organizationSettings[0]?.work_days || [];

    const holidayDates = new Set(attendancePayload.map((entry) => entry.date));

    const weekOffPayload = generateWeekOffAttendancePayload(
      user.id,
      workingDays,
    ).filter((entry) => !holidayDates.has(entry.date));

    attendancePayload.push(...weekOffPayload);
    console.log("attendancePayload: ", attendancePayload);

    const response = await attendanceRepository.bulkCreateAttendances(
      attendancePayload,
      transaction,
    );

    const attendanceLogs = response.map((attendance) => {
      return {
        attendance_id: attendance.id,
        remarks: "Week-offs/Holidays created by system.",
        type: AttendanceLogType.ENUM.SYSTEM,
        status: AttendanceStatus.ENUM.WEEK_OFF,
      };
    });

    await attendanceLogRepository.bulkCreate(attendanceLogs, { transaction });

    await transactionRepository.commitTransaction(transaction);

    return user;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getFilteredUsers = async (payload) => {
  let {
    status,
    month,
    email = "",
    archive = false,
    page = 1,
    limit = 10,
    role_uuid,
    search = "",
  } = payload.query;

  return userRepository.getFilteredUsers(
    {
      email,
      status,
      role_uuid,
      month,
    },
    { archive, page, limit, search },
  );
};

exports.verifyUser = async (payload) => {
  const { email, password } = payload.body;
  const publicUser = await publicUserRepository.findOne({ email: email });

  if (!publicUser) {
    throw new NotFoundError(
      "User not found",
      "User with provided email not found",
    );
  }

  const isVerified = await publicUser.matchPassword(password);

  if (!isVerified) {
    throw new UnauthorizedError(
      "Invalid credentials",
      "Invalid email or password",
    );
  }

  return publicUser;
};

exports.updatePassword = async (payload) => {
  const { user_uuid } = payload.params;
  const { password } = payload.body;

  const user = await publicUserRepository.findOne({ user_id: user_uuid });

  if (!user) {
    throw new NotFoundError(
      "User not found",
      "User with provided id not found",
    );
  }

  await user.updatePassword(password);
  return user.save();
};

exports.updateUser = async (payload) => {
  const { user_uuid } = payload.params;

  if (!user_uuid) {
    throw new BadRequestError(
      "User UUID is required",
      "user_uuid parameter is required",
    );
  }

  const {
    role_uuid,
    shift_uuid,
    personal_information,
    documents,
    ...userFields
  } = payload.body;

  const transaction = await transactionRepository.startTransaction();

  try {
    const userPayload = {
      ...(role_uuid && { role_id: userRepository.getLiteralFrom("role", role_uuid, "uuid") }),
      ...(shift_uuid && { shift_id: userRepository.getLiteralFrom("organization_shift", shift_uuid, "uuid") }),
      ...userFields
    };

    const user_id = await userRepository.getLiteralFrom("user", user_uuid, "user_id");
    if (personal_information) {
      await userPersonalInformationRepository.upsert(
        { user_id },
        { user_id, ...personal_information },
        { transaction },
      );
    }

    if (documents && documents.length > 0) {
      await userDocumentRepository.destroy(
        { user_id: { [Op.eq]: user_id } },
        true,
        [],
        transaction,
      );

      const documentPayload = documents.map((doc) => ({
        user_id,
        document_type: doc.document_type,
        document_number: doc.document_number,
        attachments: doc.attachments,
      }));

      await userDocumentRepository.bulkCreateUserDocuments(
        documentPayload,
        transaction,
      );
    }


    await userRepository.update({ user_id: user_uuid }, userPayload, [], transaction);
    if ("name" in userFields || "email" in userFields) {
      await publicUserRepository.update(
        { user_id: user_uuid },
        {
          name: userFields.name,
          email: userFields.email,
        },
        [],
        transaction,
      );
    }
    await transactionRepository.commitTransaction(transaction);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.getUserByEmail = async (payload) => {
  const { email } = payload.query;

  return publicUserRepository.findOne({ email });
};

exports.getUserByUuid = async (payload) => {
  const { user_uuid } = payload.params;

  return userRepository.getUserById(user_uuid, true);
};

exports.activateUser = async (payload) => {
  const { user_uuid } = payload.params;
  const org_uuid = payload.headers.org_uuid;

  const transaction = await transactionRepository.startTransaction();

  try {
    let user = await userRepository.findOne(
      { user_id: user_uuid },
      [],
      false,
      undefined,
      transaction,
    );

    if (!user) {
      throw new NotFoundError(
        "User not found",
        "User with provided uuid not found",
      );
    }

    user.activate();
    await user.save({ transaction });

    const organization = await organizationRepository.findOne(
      { uuid: org_uuid },
      [],
      false,
      undefined,
      transaction,
    );

    user = await publicUserRepository.findOne(
      { user_id: user_uuid },
      [],
      false,
      undefined,
      transaction,
    );

    if (!organization) {
      throw new NotFoundError(
        "Organization not found",
        "Organization with provided uuid not found",
      );
    }

    const organizationUser = await organizationUserRepository.findOne(
      {
        organization_id: {
          [Op.eq]: organization.id,
        },
        user_id: {
          [Op.eq]: user.id,
        },
      },
      [],
      false,
      undefined,
      transaction,
    );

    if (!organizationUser) {
      throw new NotFoundError(
        "Membership not found",
        "User is not a member of the given organization",
      );
    }

    organizationUser.activate();
    await organizationUser.save({ transaction });

    await transactionRepository.commitTransaction(transaction);

    return user;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.deactivateUser = async (payload) => {
  const { user_uuid } = payload.params;
  const org_uuid = payload.headers.org_uuid;

  const transaction = await transactionRepository.startTransaction();

  try {
    let user = await userRepository.findOne(
      { user_id: user_uuid },
      [],
      false,
      undefined,
      transaction,
    );

    if (!user) {
      throw new NotFoundError(
        "User not found",
        "User with provided uuid not found",
      );
    }

    user.deactivate();
    await user.save({ transaction });

    const organization = await organizationRepository.findOne(
      { uuid: org_uuid },
      [],
      false,
      undefined,
      transaction,
    );

    user = await publicUserRepository.findOne(
      { user_id: user_uuid },
      [],
      false,
      undefined,
      transaction,
    );

    if (!organization) {
      throw new NotFoundError(
        "Organization not found",
        "Organization with provided uuid not found",
      );
    }

    const organizationUser = await organizationUserRepository.findOne(
      {
        organization_id: {
          [Op.eq]: organization.id,
        },
        user_id: {
          [Op.eq]: user.id,
        },
      },
      [],
      false,
      undefined,
      transaction,
    );

    if (!organizationUser) {
      throw new NotFoundError(
        "Membership not found",
        "User is not a member of the given organization",
      );
    }

    organizationUser.deactivate();
    await organizationUser.save({ transaction });

    await transactionRepository.commitTransaction(transaction);

    return user;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

const getCounterBase = (value) => {
  const match = /^\{#(\d+)\}$/.exec(value);
  return match ? Number.parseInt(match[1], 10) : 0;
};

const generateCode = (tokenValue, offset) => {
  const now = new Date();

  if (/^\{#(\d+)\}$/.test(tokenValue)) {
    return String(getCounterBase(tokenValue) + offset);
  }

  switch (tokenValue) {
    case "{YYYY}":
      return String(now.getFullYear());
    case "{YY}":
      return String(now.getFullYear()).slice(-2);
    case "{MM}":
      return String(now.getMonth() + 1).padStart(2, "0");
    case "{DD}":
      return String(now.getDate()).padStart(2, "0");
    case "{-}":
      return "-";
    case "{_}":
      return "_";
    case "{.}":
      return ".";
    default:
      return tokenValue;
  }
};

exports.generateEmployeeCode = async (payload) => {
  const organizationSettings = await organizationSettingRepository.findOne();
  const employeeIdPattern = organizationSettings.employee_id_pattern;

  if (employeeIdPattern.type === EmployeeIdMode.ENUM.MANUAL) {
    throw new BadRequestError(
      "Employee ID generation is set to manual. Cannot generate employee code automatically.",
    );
  }

  const pattern = employeeIdPattern.value;
  const totalUser = await userRepository.count();

  const code = pattern.map((token) => generateCode(token, totalUser));
  return code.join("");
};
