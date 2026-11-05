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
const { AttendanceStatus, AttendanceLogType, CreateRoute, EmployeeIdMode, LeaveBalanceLogSource, Period } = require("@repo/common");
const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");
const {
  userPersonalInformationRepository,
} = require("../repositories/user-personal-information-repository");
const { validateBodyParameters } = require("../lib/validate-body-paramenters");
const { generateWeekOffForNewUser } = require("../cron-jobs/weekoffs");
const {
  attendanceLogRepository,
} = require("../repositories/attendance-log-repository");
const { allocateLeaveBalance } = require("../lib/leaves");
const {
  leaveBalanceLogRepository,
} = require("../repositories/leave-balance-log-repository");
const { teamRepository } = require("../repositories/team-repository");
const {
  syncUserTeams,
  assertUuidArray,
  replaceManagerLines,
} = require("./team-service");
const { userTeamRepository } = require("../repositories/user-team-repository");
const { isValidUUID } = require("../models/common/validator");
const {
  HierarchyTransformer,
  byName,
} = require("../http/transformers/team-transformer");


/** Normalises `manager_uuids` from a create/update body into general reporting lines. */
const generalLines = (managerUuids) =>
  assertUuidArray(managerUuids, "manager_uuids").map((manager_uuid) => ({
    manager_uuid,
    team_uuid: null,
  }));

exports.createUser = async (payload) => {
  validateBodyParameters({
    payload,
    route: CreateRoute.ENUM.CREATE_USER,
  });
  const organizationUuid = payload.headers["org_uuid"];
  const { role_uuid, shift_uuid, email, name, password, role } = payload.body;
  // Teams and managers go to user_team, not the user row.
  const { manager_uuids, team_uuids, ...userBody } = payload.body;
  if (team_uuids !== undefined) assertUuidArray(team_uuids, "team_uuids");
  const managerLines =
    manager_uuids === undefined ? null : generalLines(manager_uuids);
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

    const organizationSettings = await organizationSettingRepository.findOne({
      role_id: {
        [Op.eq]: userRepository.getLiteralFrom("role", role_uuid, "uuid"),
      },
    });
    user = await userRepository.create(
      {
        ...userBody,
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
          organizationSettings?.past_dated_leave?.balance ?? 0,
        sandwich_leave_exception_balance:
          organizationSettings?.sandwich_leave_exception?.balance ?? 0,
        clubbing_leave_exception_balance:
          organizationSettings?.clubbing_leave_exception?.balance ?? 0,
        late_exception_balance:
          organizationSettings?.clubbing_leave_exception?.balance ?? 0,
      },
      { transaction },
    );

    user = await userRepository.getUserById(
      { user_uuid: user.user_id },
      true,
      transaction,
    );

    if (team_uuids !== undefined) {
      await syncUserTeams(user.id, team_uuids, transaction);
    }
    if (managerLines?.length) {
      await replaceManagerLines(user, managerLines, { onlyGeneral: true }, transaction);
    }

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

    const createdBalances = await leaveBalanceRepository.bulkCreate(
      leaveBalancesPayload,
      { transaction },
    );

    const leaveBalanceLogs = createdBalances.map((balance) => ({
      leave_balance_id: balance.id,
      updated_balance: balance.leaves_allocated,
      amount: balance.leaves_allocated,
      source: LeaveBalanceLogSource.ENUM.INITIAL_ALLOCATION,
    }));

    await leaveBalanceLogRepository.bulkCreate(leaveBalanceLogs, {
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

    const workingDays = organizationSettings?.work_days || [];

    const holidayDates = new Set(attendancePayload.map((entry) => entry.date));

    const weekOffPayload = generateWeekOffForNewUser(
      user.id,
      workingDays,
    ).filter((entry) => !holidayDates.has(entry.date));

    attendancePayload.push(...weekOffPayload);

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
    month,
    email = "",
    archive = false,
    page = 1,
    limit = 10,
    search = "",
    managers_required = false,
    is_active,
    team_uuids,
  } = payload.query;

  if (team_uuids !== undefined) {
    team_uuids = assertUuidArray(
      Array.isArray(team_uuids) ? team_uuids : [team_uuids],
      "team_uuids",
    );
  }

  return userRepository.getFilteredUsers(
    {
      email,
      month,
      managers_required:
        managers_required === true || managers_required === "true",
      is_active,
      team_uuids,
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
    manager_uuids,
    team_uuids,
    ...userFields
  } = payload.body;

  // `is_me` skips the permission check, so a user may not move themselves in the
  // hierarchy or between teams through it.
  const canEditHierarchy = payload.headers?.is_me !== "true";
  const updatesManagers = canEditHierarchy && manager_uuids !== undefined;
  const updatesTeams = canEditHierarchy && team_uuids !== undefined;
  if (updatesTeams) assertUuidArray(team_uuids, "team_uuids");
  const managerLines = updatesManagers ? generalLines(manager_uuids) : null;

  const transaction = await transactionRepository.startTransaction();

  try {
    let targetUser = null;
    if (updatesManagers || updatesTeams) {
      targetUser = await userRepository.findOne(
        { user_id: { [Op.eq]: user_uuid } },
        [],
        true,
        ["id", "name"],
        transaction,
      );
      if (!targetUser) {
        throw new NotFoundError("User not found", "User with provided uuid not found");
      }
    }


    let userExceptionSettingsCount = {};
    if (role_uuid) {
      const roleSettings =
        await organizationSettingRepository.getOrganizationSetting(role_uuid);

      userExceptionSettingsCount = {
        past_dated_leave_balance: roleSettings?.past_dated_leave?.balance ?? 0,
        sandwich_leave_exception_balance:
          roleSettings?.sandwich_leave_exception?.balance ?? 0,
        clubbing_leave_exception_balance:
          roleSettings?.clubbing_leave_exception?.balance ?? 0,
        late_exception_balance: roleSettings?.late_exception?.balance ?? 0,
      };
    }
    const userPayload = {
      ...(role_uuid && {
        role_id: userRepository.getLiteralFrom("role", role_uuid, "uuid"),
      }),
      ...(shift_uuid && {
        shift_id: userRepository.getLiteralFrom(
          "organization_shift",
          shift_uuid,
          "uuid",
        ),
      }),
      ...userFields,
      ...userExceptionSettingsCount,
    };

    const user_id = await userRepository.getLiteralFrom(
      "user",
      user_uuid,
      "user_id",
    );
    if (personal_information) {
      await userPersonalInformationRepository.upsert(
        { user_id },
        { user_id, ...personal_information },
        { transaction },
      );
    }

    await userDocumentRepository.destroy(
      { user_id: { [Op.eq]: user_id } },
      true,
      [],
      transaction,
    );

    if (documents && documents.length > 0) {
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

    await userRepository.update(
      { user_id: user_uuid },
      userPayload,
      [],
      transaction,
    );

    if (updatesTeams) {
      await syncUserTeams(targetUser.id, team_uuids, transaction);
    }
    if (updatesManagers) {
      await replaceManagerLines(targetUser, managerLines, { onlyGeneral: true }, transaction);
    }

    if (role_uuid) {
      const previousLeaveBalances =
        await leaveBalanceRepository.listLeaveBalance({
          user_uuid,
          period: Period.getCurrentPeriod(),
        });

      const { rows: leaveTypes } =
        await leaveTypeRepository.getFilteredLeaveTypes(
          {
            role_uuid,
          },
          {},
        );

      const user = await userRepository.getUserById(
        { user_uuid },
        true,
        transaction,
      );

      const newLeaveTypes = leaveTypes.filter((leaveType) => {
        return !previousLeaveBalances.some(
          (balance) =>
            balance.leave_type_id === leaveType.id &&
            balance.is_sealed === false,
        );
      });

      const oldBalances = previousLeaveBalances.filter((balance) => {
        return !leaveTypes.some(
          (leaveType) => leaveType.id === balance.leave_type_id,
        );
      });

      const rawPayload = (
        await Promise.all(
          newLeaveTypes.map((leaveType) =>
            allocateLeaveBalance([user], leaveType),
          ),
        )
      ).flat();

      oldBalances.forEach((oldBalance) => {
        if (oldBalance.balance > 0) {
          const transferLeaveTypeId =
            oldBalance.leave_type?.transfer_leave_type?.id;

          if (transferLeaveTypeId) {
            const targetBalance = rawPayload.find(
              (balance) => balance.leave_type_id === transferLeaveTypeId,
            );

            if (targetBalance) {
              targetBalance.balance += Number(oldBalance.balance);
              targetBalance.leaves_allocated += Number(oldBalance.balance);

              oldBalance.balance = 0;
            }
          }
        }

        rawPayload.push({
          ...oldBalance.get({ plain: true }),
          is_sealed: true,
        });
      });

      const leaveBalancesPayload = rawPayload.map((item) => ({
        user_id: item.user_id,
        leave_type_id: item.leave_type_id,
        period: item.period || currentPeriod,
        balance: Number(item.balance || 0),
        leaves_allocated: Number(item.leaves_allocated || 0),
        is_sealed: Boolean(item.is_sealed),
      }));

      if (leaveBalancesPayload.length) {
        await leaveBalanceRepository.bulkCreate(leaveBalancesPayload, {
          updateOnDuplicate: ["balance", "leaves_allocated", "is_sealed"],
          conflictAttributes: ["user_id", "leave_type_id", "period"],
          transaction,
        });
      }
    }

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

  const user = await userRepository.getUserById({ user_uuid }, true, undefined, true);
  if (!user) return user;
  const lines = await userTeamRepository.findLines({ userIds: [user.id] });
  return {
    ...user.toJSON(),
    managers: lines.map(HierarchyTransformer.transformManager),
  };
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

    const activeReports = await userTeamRepository.countActiveReports(user.id, transaction);
    if (activeReports > 0) {
      throw new ConflictError(
        `This user has ${activeReports} active direct report(s). Assign them to another manager before deactivating.`,
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
  const { role_uuid } = payload.query;
  const organizationSettings = await organizationSettingRepository.findOne({
    role_id: {
      [Op.eq]: userRepository.getLiteralFrom("role", role_uuid),
    },
  });
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

// ───────────── Hierarchy ─────────────

/**
 * The org graph: `{ people, lines }`. People are everyone (or the team's members, or
 * a root and everyone below them); lines are the reporting lines between them. A
 * person can have several managers, so this is a graph rather than a tree.
 */
exports.getHierarchy = async (payload) => {
  const { root_uuid, team_uuid } = payload.query;
  if (root_uuid !== undefined && !isValidUUID(root_uuid)) {
    throw new BadRequestError("Invalid root_uuid.");
  }
  if (team_uuid !== undefined && !isValidUUID(team_uuid)) {
    throw new BadRequestError("Invalid team_uuid.");
  }

  let teamId;
  if (team_uuid) {
    const team = await teamRepository.findOne(
      { uuid: { [Op.eq]: team_uuid } },
      [],
      true,
      ["id"],
    );
    if (!team) throw new NotFoundError("Team not found.");
    teamId = team.id;
  }

  let rootIds;
  if (root_uuid) {
    const root = await userRepository.findOne(
      { user_id: { [Op.eq]: root_uuid } },
      [],
      true,
      ["id"],
    );
    if (!root) throw new NotFoundError("User not found.");
    rootIds = [root.id, ...(await userTeamRepository.descendantIds(root.id, { teamId }))];
  }

  const ids = await userRepository.findHierarchyIds({ teamId, rootIds });
  if (root_uuid && !ids.length) {
    throw new NotFoundError("User not found in this team.");
  }
  const included = new Set(ids);

  const [users, reportCounts, lines] = await Promise.all([
    userRepository.findHierarchyUsers(ids),
    userTeamRepository.reportCounts(ids, teamId),
    userTeamRepository.findLines({ userIds: ids, teamId }),
  ]);

  return {
    people: users
      .map((user) =>
        HierarchyTransformer.transformNode(user, reportCounts.get(user.id) || 0),
      )
      .sort(byName),
    lines: lines
      .filter((line) => included.has(line.manager_id))
      .map(HierarchyTransformer.transformLine),
  };
};

/** Everyone above a user through any of their lines, nearest first (`level` 1 = direct). */
exports.getManagerChain = async (payload) => {
  const { user_uuid } = payload.params;
  if (!isValidUUID(user_uuid)) {
    throw new BadRequestError("Invalid user uuid.");
  }

  const user = await userRepository.findOne(
    { user_id: { [Op.eq]: user_uuid } },
    [],
    true,
    ["id"],
  );
  if (!user) {
    throw new NotFoundError("User not found", "User with provided uuid not found");
  }

  const chain = await userTeamRepository.ancestors(user.id);
  const ids = chain.map((row) => row.id);
  const [managers, reportCounts] = await Promise.all([
    userRepository.findHierarchyUsers(ids),
    userTeamRepository.reportCounts(ids),
  ]);
  const managersById = new Map(managers.map((manager) => [manager.id, manager]));

  return chain
    .filter((row) => managersById.has(row.id))
    .map((row) => ({
      level: row.level,
      ...HierarchyTransformer.transformNode(
        managersById.get(row.id),
        reportCounts.get(row.id) || 0,
      ),
    }));
};

/**
 * Replaces all of a user's reporting lines with `managers`
 * (`[{ manager_uuid, team_uuid? }]`; empty clears them). Used by the org canvas.
 */
exports.setManagers = async (payload) => {
  const { user_uuid } = payload.params;
  if (!isValidUUID(user_uuid)) {
    throw new BadRequestError("Invalid user uuid.");
  }
  if (!Array.isArray(payload.body?.managers)) {
    throw new BadRequestError("managers is required (an empty array clears them).");
  }

  const transaction = await transactionRepository.startTransaction();
  try {
    const user = await userRepository.findOne(
      { user_id: { [Op.eq]: user_uuid } },
      [],
      true,
      ["id", "user_id", "name"],
      transaction,
    );
    if (!user) {
      throw new NotFoundError("User not found", "User with provided uuid not found");
    }

    await replaceManagerLines(user, payload.body.managers, {}, transaction);
    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }

  const user = await userRepository.findOne(
    { user_id: { [Op.eq]: user_uuid } },
    [],
    true,
    ["id"],
  );
  const lines = await userTeamRepository.findLines({ userIds: [user.id] });
  return { user_id: user_uuid, managers: lines.map(HierarchyTransformer.transformManager) };
};
