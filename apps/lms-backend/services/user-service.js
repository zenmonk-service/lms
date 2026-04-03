const { setSchema } = require("../lib/schema");
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
const { sequelize } = require("../config/db-connection");
const {
  organizationUserRepository,
} = require("../repositories/organization-user-repository");
const {
  organizationRepository,
} = require("../repositories/organization-repository");
const { shiftRepository } = require("../repositories/shift-repository");
const { attendanceRepository } = require("../repositories/attendance-repository");
const { AttendanceStatus } = require("../models/tenants/attendance/enum/attendance-status-enum");
const moment = require("moment-timezone");
const { organizationSettingRepository } = require("../repositories/organization-setting-repository");
const { userPersonalInformationRepository } = require("../repositories/user-personal-information-repository");

exports.createUser = async (payload) => {
  const organizationUuid =
    payload.params.organization_uuid || payload.headers["org_uuid"];

  const transaction = await transactionRepository.startTransaction();

  try {
    setSchema(process.env.DB_PUBLIC_SCHEMA);

    const organization_id = await publicUserRepository.getLiteralFrom(
      "organization",
      organizationUuid,
      "uuid",
    );
    if (!organization_id) {
      throw new Error(`Organization with uuid ${organizationUuid} not found`);
    }

    let user = await publicUserRepository.findOne({
      email: payload.body.email,
    });

    if (!user) {
      user = await publicUserRepository.create(
        {
          email: payload.body.email,
          name: payload.body.name,
          password: payload.body.password,
          role: payload.body.role,
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

    setSchema(organizationUuid);

    const role_id = await userRepository.getLiteralFrom(
      "role",
      payload.body.role_uuid,
      "uuid",
    );
    const shift_id = await shiftRepository.getLiteralFrom(
      "organization_shift",
      payload.body.shift_uuid,
      "uuid",
    );

    user = await userRepository.create(
      {
        ...payload.body,
        role_id,
        shift_id,
        user_id: user.user_id,
      },
      { transaction },
    );

    //adding leave balances for new user
    const leaveTypes = await leaveTypeRepository.findAll({
      [Op.and]: [
        {
          applicable_for: {
            type: "role",
          },
        },
        sequelize.literal(
          `'${payload.body.role_uuid}' = ANY (SELECT jsonb_array_elements_text("applicable_for"->'value'))`,
        ),
      ],
    });
    const leaveBalancesPayload = (
      await Promise.all(
        leaveTypes.map((leaveType) => allocateLeaveBalance([user], leaveType))
      )
    ).flat();

    await leaveBalanceRepository.bulkCreate(leaveBalancesPayload, {
      transaction,
    });

    //adding holidays of organization
    const today = new Date().toISOString().split("T")[0];
    const attendanceDates = await attendanceRepository.findAll(
      { status: AttendanceStatus.ENUM.HOLIDAY, date: { [Op.gte]: today } },
      [],
      true,
      ["date"],
      undefined,
      { group: ["date"], order: [["date", "ASC"]] }
    );
    
    const attendancePayload = attendanceDates.map((attendance) => {
      return {
        date: attendance.date,
        user_id: user.id,
        status: AttendanceStatus.ENUM.HOLIDAY,
      };
    });

    const organizationSettings = await organizationSettingRepository.findAll();
    console.log('organizationSettings: ', organizationSettings);
    const workingDays = organizationSettings[0]?.work_days || [];
    console.log('workingDays: ', workingDays);

    const startDate = moment();
    const endDate = moment().add(3, "months").endOf("day");

    let currDate = startDate.clone();
    const existingDates = new Set(attendancePayload.map((item) => item.date));

    while (currDate.isSameOrBefore(endDate)) {
      const dayName = currDate.format("dddd").toLowerCase();
      console.log('dayName: ', dayName);
      const dateString = currDate.format("YYYY-MM-DD");

      if (!workingDays.includes(dayName) && !existingDates.has(dateString)) {
        attendancePayload.push({
          date: dateString,
          user_id: user.id,
          status: AttendanceStatus.ENUM.WEEK_OFF,
        });
      }

      currDate.add(1, "day");
    }
    
    console.log('attendancePayload: ', attendancePayload);
    await attendanceRepository.bulkCreateAttendances(attendancePayload, transaction);

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
    name,
    email,
    role,
    shift_uuid,
    image,
    marital_status,
    employment_type,
    work_mode,
    work_branch,
    official_phone,
    emergency_contact_name,
    emergency_contact_relation,
    emergency_contact_phone,
    guardian_contact_name,
    guardian_contact_relation,
    guardian_contact_phone,
  } = payload.body;

  const role_id = await userRepository.getLiteralFrom("role", role, "uuid");
  const shift_id = await userRepository.getLiteralFrom(
    "organization_shift",
    shift_uuid,
    "uuid",
  );

  const tenantData = {};
  const publicData = {};
  const personalInfoData = {};

  if (name) {
    tenantData.name = name;
    publicData.name = name;
  }
  if (image) {
    tenantData.image = image;
  }
  if (email) {
    tenantData.email = email;
    publicData.email = email;
  }
  if (role) tenantData.role_id = role_id;
  if (shift_uuid) tenantData.shift_id = shift_id;

  if (marital_status) {
    personalInfoData.marital_status = marital_status;
  }
  if (employment_type) {
    personalInfoData.employment_type = employment_type;
  }
  if (work_mode) {
    personalInfoData.work_mode = work_mode;
  }
  if (work_branch) {
    personalInfoData.work_branch = work_branch;
  }
  if (official_phone) {
    personalInfoData.official_phone = official_phone;
  }
  if (emergency_contact_name) {
    personalInfoData.emergency_contact_name = emergency_contact_name;
  }
  if (emergency_contact_relation) {
    personalInfoData.emergency_contact_relation = emergency_contact_relation;
  }
  if (emergency_contact_phone) {
    personalInfoData.emergency_contact_phone = emergency_contact_phone;
  }
  if (guardian_contact_name) {
    personalInfoData.guardian_contact_name = guardian_contact_name;
  }
  if (guardian_contact_relation) {
    personalInfoData.guardian_contact_relation = guardian_contact_relation;
  }
  if (guardian_contact_phone) {
    personalInfoData.guardian_contact_phone = guardian_contact_phone;
  }

  await userRepository.update({ user_id: user_uuid }, tenantData );
  const user_id = await userRepository.getLiteralFrom("user", user_uuid, "user_id");
  await userPersonalInformationRepository.upsert({ user_id: user_id }, {user_id: user_id, ...personalInfoData} );

  setSchema(process.env.DB_PUBLIC_SCHEMA);

  await publicUserRepository.update({ user_id: user_uuid }, publicData);
};

exports.getUserDocuments = async (payload) => {
  const { user_uuid } = payload.params;
  const org_uuid = payload.headers.org_uuid;

  setSchema(org_uuid);

  const user = await userRepository.findOne({ user_id: user_uuid });
  if (!user) {
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );
  }

  return userDocumentRepository.listUserDocuments(user.id);
};

exports.createUserDocument = async (payload) => {
  const { user_uuid } = payload.params;
  const org_uuid = payload.headers.org_uuid;
  const {
    document_name,
    document_type,
    document_number,
    file_url,
    file_urls,
    metadata,
  } = payload.body;

  setSchema(org_uuid);

  if (!document_name) {
    throw new BadRequestError(
      "Document name is required",
      "document_name is required",
    );
  }

  const user = await userRepository.findOne({ user_id: user_uuid });
  if (!user) {
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );
  }

  const normalizedFileUrls = Array.isArray(file_urls)
    ? file_urls
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const primaryFileUrlCandidate =
    normalizedFileUrls[0] ||
    (typeof file_url === "string" ? file_url.trim() : "");

  if (!primaryFileUrlCandidate) {
    throw new BadRequestError(
      "File URL is required",
      "At least one document file URL is required",
    );
  }

  const normalizedMetadata =
    metadata && typeof metadata === "object" ? { ...metadata } : null;

  const document = await userDocumentRepository.create({
    user_id: user.id,
    document_name: document_name,
    document_type: document_type,
    document_number: document_number,
    file_url: primaryFileUrlCandidate,
    file_urls: normalizedFileUrls.length > 0 ? normalizedFileUrls : null,
    metadata: normalizedMetadata,
  });

  return document.toJSON();
};

exports.deleteUserDocument = async (payload) => {
  const { user_uuid, document_uuid } = payload.params;
  const org_uuid = payload.headers.org_uuid;

  setSchema(org_uuid);

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

  const deletedRows = await userDocumentRepository.destroy({
    uuid: document_uuid,
    user_id: user.id,
  });

  if (!deletedRows) {
    throw new NotFoundError(
      "Document not found",
      "User document with provided uuid not found",
    );
  }

  return { success: true };
};

exports.getUserByEmail = async (payload) => {
  const { email } = payload.query;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  setSchema(process.env.DB_PUBLIC_SCHEMA);

  return publicUserRepository.findOne({ email });
};

exports.activateUser = async (payload) => {
  const { user_uuid } = payload.params;
  const org_uuid = payload.headers.org_uuid;

  let user = await userRepository.findOne({ user_id: user_uuid });

  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );

  user.activate();
  await user.save();

  setSchema(process.env.DB_PUBLIC_SCHEMA);

  const organization = await organizationRepository.findOne({ uuid: org_uuid });
  user = await publicUserRepository.findOne({ user_id: user_uuid });

  if (!organization) {
    throw new NotFoundError(
      "Organization not found",
      "Organization with provided uuid not found",
    );
  }

  const organizationUser = await organizationUserRepository.findOne({
    organization_id: { [Op.eq]: organization.id },
    user_id: { [Op.eq]: user.id },
  });

  if (!organizationUser) {
    throw new NotFoundError(
      "Membership not found",
      "User is not a member of the given organization",
    );
  }

  organizationUser.activate();
  await organizationUser.save();
};

exports.deactivateUser = async (payload) => {
  const { user_uuid } = payload.params;
  const org_uuid = payload.headers.org_uuid;

  const transaction = await transactionRepository.startTransaction();

  try {
    let user = await userRepository.findOne({ user_id: user_uuid });

    if (!user)
      throw new NotFoundError(
        "User not found",
        "User with provided uuid not found",
      );

    user.deactivate();
    await user.save();

    setSchema(process.env.DB_PUBLIC_SCHEMA);

    const organization = await organizationRepository.findOne({
      uuid: org_uuid,
    });
    user = await publicUserRepository.findOne({ user_id: user_uuid });

    if (!organization) {
      throw new NotFoundError(
        "Organization not found",
        "Organization with provided uuid not found",
      );
    }

    const organizationUser = await organizationUserRepository.findOne({
      organization_id: { [Op.eq]: organization.id },
      user_id: { [Op.eq]: user.id },
    });

    if (!organizationUser) {
      throw new NotFoundError(
        "Membership not found",
        "User is not a member of the given organization",
      );
    }

    organizationUser.deactivate();
    await organizationUser.save();

    await transactionRepository.commitTransaction(transaction);

    return user;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getAttendanceReport = async (payload) => {
  payload = await this.validateQueryParameters(payload);
  let { date_range, status, organization_uuid } = payload.query;
  const { user_uuid } = payload.params;
  if (!date_range) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const start_date = startOfMonth.toISOString().slice(0, 10);
    const end_date = today.toISOString().slice(0, 10);

    payload.query.date_range = [start_date, end_date];
  }

  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 6);

  const userTotalHours = await attendanceRepository.getTotalHours({
    user_uuid,
    date_range: [pastDate, today],
  });

  const organizationAffectedHours =
    await organizationService.getAvarageWorkingHours({
      organization_uuid,
      date_range: [pastDate, today],
    });
  const holidaysCount = await organizationHolidayRepository.getHolidaysCount({
    organization_uuid,
    date_range: [pastDate, today],
  });
  // const leavesCount = await leaveRequestRepository.getApprovedLeaveRequestCount({user_uuid, date_range: [pastDate, today]});

  // totalWorkingDaysOfUser= totalWorkingDaysOfOrganization-holidaysCount-leaveCount;
  const totalWorkingDaysOfUser = 7 - holidaysCount;
  const totalWorkingDaysOfOrganization = 7 - holidaysCount;

  const status_response = await attendanceRepository.getAttendanceStatus({
    user_uuid,
    date_range,
    status,
  });
  const status_count = new Map();
  await Promise.all(
    status_response.map((response) => {
      if (status_count.has(response.status)) {
        status_count.set(
          response.status,
          status_count.get(response.status) + 1,
        );
      } else {
        status_count.set(response.status, 1);
      }
    }),
  );
  const affected_hours = await attendanceRepository.getAttendanceAffectedHours({
    user_uuid,
    date_range: [pastDate, today],
  });
  const status_count_obj = Object.fromEntries(status_count);

  return {
    status_count: status_count_obj,
    affected_hours,
    avarage: {
      user: parseFloat((userTotalHours / totalWorkingDaysOfUser).toFixed(2)),
      organization: parseFloat(
        (organizationAffectedHours / totalWorkingDaysOfOrganization).toFixed(2),
      ),
    },
  };
};
