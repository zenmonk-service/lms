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
const { Op } = require("sequelize");
const { sequelize } = require("../config/db-connection");
const {
  organizationUserRepository,
} = require("../repositories/organization-user-repository");
const {
  organizationRepository,
} = require("../repositories/organization-repository");
const attendanceRepository = require("../repositories/attendance-repository");
const { shiftRepository } = require("../repositories/shift-repository");

const normalizeOptional = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
};

const DOCUMENT_NAME_MAX_LENGTH = 100;
const DOCUMENT_NUMBER_MAX_LENGTH = 100;
const DOCUMENT_URL_MAX_LENGTH = 2048;
const DOCUMENT_FILE_NAME_MAX_LENGTH = 255;

const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    throw new BadRequestError(
      `${fieldName} exceeds maximum length`,
      `${fieldName} must be at most ${maxLength} characters long`
    );
  }
};

const quoteIdentifier = (identifier) =>
  `"${String(identifier).replaceAll('"', '""')}"`;

const ensureUserDocumentFileUrlsColumn = async (schema) => {
  const schemaName = quoteIdentifier(schema);
  const tableName = `${schemaName}."user_document"`;

  const [result] = await sequelize.query(
    `SELECT to_regclass('${tableName.replaceAll("'", "''")}') AS table_ref`
  );

  if (!result?.[0]?.table_ref) {
    return;
  }

  await sequelize.query(
    `ALTER TABLE ${tableName}
     ADD COLUMN IF NOT EXISTS "file_urls" JSONB`
  );

  await sequelize.query(
    `UPDATE ${tableName}
     SET "file_urls" = jsonb_build_array("file_url")
     WHERE "file_urls" IS NULL
       AND "file_url" IS NOT NULL
       AND "file_url" <> ''`
  );
};

exports.createUser = async (payload) => {
  const organizationUuid =
    payload.params.organization_uuid || payload.headers["org_uuid"];

  const transaction = await transactionRepository.startTransaction();

  try {
    setSchema(process.env.DB_PUBLIC_SCHEMA);

    const organization_id = await publicUserRepository.getLiteralFrom(
      "organization",
      organizationUuid,
      "uuid"
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
        { transaction }
      );
    }
    const organizationUser = await organizationUserRepository.findOne(
      { organization_id: { [Op.eq]: organization_id }, user_id: { [Op.eq]: user.id } }
    );
    if (!organizationUser) {
      await organizationUserRepository.create(
        { organization_id, user_id: user.id },
        { transaction }
      );
    }else{
      throw new ConflictError('User already exists in Organization.')
    }

    setSchema(organizationUuid);

    const role_id = await userRepository.getLiteralFrom(
      "role",
      payload.body.role_uuid,
      "uuid"
    );
       const shift_id = await shiftRepository.getLiteralFrom(
      "organization_shift",
      payload.body.shift_uuid,
      "uuid"
    );

    user = await userRepository.create(
      {
        ...payload.body,
        role_id,
        shift_id,
        user_id: user.user_id,
      },
      { transaction }
    );

    const leaveTypes = await leaveTypeRepository.findAll({
      [Op.and]: [
        {
          applicable_for: {
            type: "role",
          },
        },
        sequelize.literal(
          `'${payload.body.role_uuid}' = ANY (SELECT jsonb_array_elements_text("applicable_for"->'value'))`
        ),
      ],
    });
    const leaveBalancesPayload = leaveTypes.map((leaveType) => ({
      user_id: user.id,
      leave_type_id: leaveType.id,
      balance: leaveType.getLeaveCount(),
      leaves_allocated: leaveType.getLeaveCount(),
    }));

    await leaveBalanceRepository.bulkCreate(leaveBalancesPayload, {
      transaction,
    });

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
    { archive, page, limit, search }
  );
};

exports.verifyUser = async (payload) => {
  const { email, password } = payload.body;
  const publicUser = await publicUserRepository.findOne({ email: email });

  if (!publicUser) {
    throw new NotFoundError(
      "User not found",
      "User with provided email not found"
    );
  }

  const isVerified = await publicUser.matchPassword(password);

  if (!isVerified) {
    throw new UnauthorizedError(
      "Invalid credentials",
      "Invalid email or password"
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
      "User with provided id not found"
    );
  }

  await user.updatePassword(password);
  return user.save();
};

exports.updateUser = async (payload) => {
  const { user_uuid } = payload.params;
  const {
    name,
    email,
    role,
    shift_uuid,
    image,
    designation,
    employment_type,
    work_mode,
    work_branch,
    official_phone,
    emergency_contact_name,
    emergency_contact_relation,
    emergency_contact_phone,
  } = payload.body;

  const role_id = await userRepository.getLiteralFrom("role", role, "uuid");
  const shift_id = await userRepository.getLiteralFrom("organization_shift", shift_uuid, "uuid");

  const tenantData = {};
  const publicData = {};

  if (name) {
    tenantData.name = name;
    publicData.name = name;
  }
  if (Object.hasOwn(payload.body, "image")) {
    tenantData.image = image;
    publicData.image = image;
  }
  if (email) {
    tenantData.email = email;
    publicData.email = email;
  }
  if (role) tenantData.role_id = role_id;
  if (shift_uuid) tenantData.shift_id = shift_id;

  if (Object.hasOwn(payload.body, "designation")) {
    tenantData.designation = normalizeOptional(designation);
  }
  if (Object.hasOwn(payload.body, "employment_type")) {
    tenantData.employment_type = normalizeOptional(employment_type);
  }
  if (Object.hasOwn(payload.body, "work_mode")) {
    tenantData.work_mode = normalizeOptional(work_mode);
  }
  if (Object.hasOwn(payload.body, "work_branch")) {
    tenantData.work_branch = normalizeOptional(work_branch);
  }
  if (Object.hasOwn(payload.body, "official_phone")) {
    tenantData.official_phone = normalizeOptional(official_phone);
  }
  if (Object.hasOwn(payload.body, "emergency_contact_name")) {
    tenantData.emergency_contact_name = normalizeOptional(emergency_contact_name);
  }
  if (Object.hasOwn(payload.body, "emergency_contact_relation")) {
    tenantData.emergency_contact_relation = normalizeOptional(
      emergency_contact_relation
    );
  }
  if (Object.hasOwn(payload.body, "emergency_contact_phone")) {
    tenantData.emergency_contact_phone = normalizeOptional(
      emergency_contact_phone
    );
  }
  
  await userRepository.update({ user_id: user_uuid }, tenantData);

  setSchema(process.env.DB_PUBLIC_SCHEMA);

  await publicUserRepository.update({ user_id: user_uuid }, publicData);
};

exports.getUserDocuments = async (payload) => {
  const { user_uuid } = payload.params;
  const org_uuid = payload.headers.org_uuid;

  await ensureUserDocumentFileUrlsColumn(org_uuid);

  setSchema(org_uuid);

  const user = await userRepository.findOne({ user_id: user_uuid });
  if (!user) {
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found"
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

  await ensureUserDocumentFileUrlsColumn(org_uuid);

  setSchema(org_uuid);

  const user = await userRepository.findOne({ user_id: user_uuid });
  if (!user) {
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found"
    );
  }

  const normalizedFileUrls = Array.isArray(file_urls)
    ? file_urls
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const primaryFileUrlCandidate =
    normalizedFileUrls[0] || (typeof file_url === "string" ? file_url.trim() : "");

  if (!primaryFileUrlCandidate) {
    throw new BadRequestError(
      "File URL is required",
      "At least one document file URL is required"
    );
  }

  validateMaxLength(primaryFileUrlCandidate, DOCUMENT_URL_MAX_LENGTH, "file_url");
  normalizedFileUrls.forEach((url) =>
    validateMaxLength(url, DOCUMENT_URL_MAX_LENGTH, "file_urls")
  );

  const normalizedDocumentName = normalizeOptional(document_name);
  if (!normalizedDocumentName) {
    throw new BadRequestError(
      "Document name is required",
      "document_name is required"
    );
  }

  validateMaxLength(
    normalizedDocumentName,
    DOCUMENT_NAME_MAX_LENGTH,
    "document_name"
  );

  const normalizedDocumentNumber = normalizeOptional(document_number);
  validateMaxLength(
    normalizedDocumentNumber,
    DOCUMENT_NUMBER_MAX_LENGTH,
    "document_number"
  );

  const normalizedMetadata =
    metadata && typeof metadata === "object" ? { ...metadata } : null;

  if (normalizedMetadata && Array.isArray(normalizedMetadata.uploaded_file_names)) {
    normalizedMetadata.uploaded_file_names = normalizedMetadata.uploaded_file_names
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => {
        validateMaxLength(
          value,
          DOCUMENT_FILE_NAME_MAX_LENGTH,
          "uploaded_file_names"
        );
        return value;
      });
  }

  const document = await userDocumentRepository.create({
    user_id: user.id,
    document_name: normalizedDocumentName,
    document_type: normalizeOptional(document_type),
    document_number: normalizedDocumentNumber,
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

  const user = await userRepository.findOne({ user_id: user_uuid });
  if (!user) {
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found"
    );
  }

  const deletedRows = await userDocumentRepository.destroy({
    uuid: document_uuid,
    user_id: user.id,
  });

  if (!deletedRows) {
    throw new NotFoundError(
      "Document not found",
      "User document with provided uuid not found"
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
      "User with provided uuid not found"
    );

  user.activate();
  await user.save();

  setSchema(process.env.DB_PUBLIC_SCHEMA);

  const organization = await organizationRepository.findOne({ uuid: org_uuid });
  user = await publicUserRepository.findOne({ user_id: user_uuid });

  if (!organization) {
    throw new NotFoundError(
      "Organization not found",
      "Organization with provided uuid not found"
    );
  }

  const organizationUser = await organizationUserRepository.findOne({
    organization_id: { [Op.eq]: organization.id },
    user_id: { [Op.eq]: user.id },
  });

  if (!organizationUser) {
    throw new NotFoundError(
      "Membership not found",
      "User is not a member of the given organization"
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
        "User with provided uuid not found"
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
        "Organization with provided uuid not found"
      );
    }

    const organizationUser = await organizationUserRepository.findOne({
      organization_id: { [Op.eq]: organization.id },
      user_id: { [Op.eq]: user.id },
    });

    if (!organizationUser) {
      throw new NotFoundError(
        "Membership not found",
        "User is not a member of the given organization"
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

    const userTotalHours = await attendanceRepository.getTotalHours({ user_uuid, date_range: [pastDate, today] });

    const organizationAffectedHours = await organizationService.getAvarageWorkingHours({ organization_uuid, date_range: [pastDate, today] });;
    const holidaysCount = await organizationHolidayRepository.getHolidaysCount({ organization_uuid, date_range: [pastDate, today] });
    // const leavesCount = await leaveRequestRepository.getApprovedLeaveRequestCount({user_uuid, date_range: [pastDate, today]});

    // totalWorkingDaysOfUser= totalWorkingDaysOfOrganization-holidaysCount-leaveCount;
    const totalWorkingDaysOfUser = 7 - holidaysCount;
    const totalWorkingDaysOfOrganization = 7 - holidaysCount;

    const status_response = await attendanceRepository.getAttendanceStatus({ user_uuid, date_range, status });
    const status_count = new Map();
    await Promise.all(status_response.map(response => {
        if (status_count.has(response.status)) {
            status_count.set(response.status, status_count.get(response.status) + 1);
        } else {
            status_count.set(response.status, 1);
        }
    }));
    const affected_hours = await attendanceRepository.getAttendanceAffectedHours({ user_uuid, date_range: [pastDate, today] });
    const status_count_obj = Object.fromEntries(status_count);

    return {
        status_count: status_count_obj,
        affected_hours,
        avarage: {
            user: parseFloat((userTotalHours / totalWorkingDaysOfUser).toFixed(2)),
            organization: parseFloat((organizationAffectedHours / totalWorkingDaysOfOrganization).toFixed(2))
        }
    };
}
