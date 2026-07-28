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
const Period = require("../lib/period");
const { generateWeekOffAttendancePayload } = require("../cron-jobs/weekoffs");

exports.createUser = async (payload) => {
  payload = await validateBodyParameters({
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

    const role_id = await userRepository.getLiteralFrom(
      "role",
      role_uuid,
      "uuid",
    );
    const shift_id = shift_uuid
      ? await shiftRepository.getLiteralFrom(
          "organization_shift",
          shift_uuid,
          "uuid",
        )
      : null;
    const organizationSettings = await organizationSettingRepository.findAll();
    user = await userRepository.create(
      {
        ...payload.body,
        role_id,
        shift_id,
        user_id: user.user_id,
        past_dated_leave_balance:
          organizationSettings[0]?.past_dated_leave?.balance || null,
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
        attendance_log: {
          type: AttendanceLogType.ENUM.BULK_CREATE,
          remarks: "Organization Holiday Created.",
        },
      };
    });

    const workingDays = organizationSettings[0]?.work_days || [];

    const holidayDates = new Set(attendancePayload.map((entry) => entry.date));

    const weekOffPayload = generateWeekOffAttendancePayload(
      user.id,
      workingDays,
    ).filter((entry) => !holidayDates.has(entry.date));

    attendancePayload.push(...weekOffPayload);
    console.log('attendancePayload: ', attendancePayload);

    await attendanceRepository.bulkCreateAttendances(
      attendancePayload,
      transaction,
    );

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

  const { name, email, role_uuid, shift_uuid, image, personal_information } =
    payload.body;

  const userPayload = {
    name,
    email,
    image,
    role_id: role_uuid
      ? userRepository.getLiteralFrom("role", role_uuid, "uuid")
      : undefined,
    shift_id: shift_uuid
      ? userRepository.getLiteralFrom("organization_shift", shift_uuid, "uuid")
      : undefined,
  };

  if (personal_information) {
    const user_id = await userRepository.getLiteralFrom(
      "user",
      user_uuid,
      "user_id",
    );
    await userPersonalInformationRepository.upsert(
      { user_id },
      { user_id, ...personal_information },
    );
  }

  if (Object.keys(userPayload).length > 0) {
    await userRepository.update({ user_id: user_uuid }, userPayload);
    await publicUserRepository.update({ user_id: user_uuid }, userPayload);
  }
};

exports.createUserDocument = async (payload) => {
  const { user_uuid } = payload.params;

  await userDocumentRepository.create({
    user_id: userDocumentRepository.getLiteralFrom(
      "user",
      user_uuid,
      "user_id",
    ),
    ...payload.body,
  });
};

exports.deleteUserDocument = async (payload) => {
  const { user_uuid, document_uuid } = payload.params;

  if (!document_uuid) {
    throw new BadRequestError(
      "Document UUID is required",
      "document_uuid parameter is required",
    );
  }

  const user = await userRepository.findOne({ user_id: user_uuid });
  if (!user) {
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );
  }

  await userDocumentRepository.destroy({
    uuid: document_uuid,
    user_id: user.id,
  });
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
