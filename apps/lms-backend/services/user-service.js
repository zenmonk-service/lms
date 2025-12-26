const { setSchema } = require("../lib/schema");
const { NotFoundError, UnauthorizedError, ConflictError } = require("../middleware/error");
const {
  publicUserRepository,
} = require("../repositories/public-user-repository");
const { userRepository } = require("../repositories/user-repository");
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

    user = await userRepository.create(
      {
        ...payload.body,
        role_id,
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
  const { name, email, role } = payload.body;
  const role_id = await userRepository.getLiteralFrom("role", role, "uuid");

  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role_id = role_id;

  await userRepository.update({ user_id: user_uuid }, data);

  setSchema(process.env.DB_PUBLIC_SCHEMA);

  await publicUserRepository.update({ user_id: user_uuid }, data);
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
