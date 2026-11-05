const { Op } = require("sequelize");
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require("../middleware/error");
const { isValidUUID } = require("../models/common/validator");
const { teamRepository } = require("../repositories/team-repository");
const { userTeamRepository } = require("../repositories/user-team-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");

// ───────────── Helpers ─────────────

const assertUuidArray = (value, field) => {
  if (!Array.isArray(value)) {
    throw new BadRequestError(`${field} must be an array of UUIDs.`);
  }
  const invalid = value.find((uuid) => !isValidUUID(uuid));
  if (invalid !== undefined) {
    throw new BadRequestError(`${field} contains an invalid UUID: ${invalid}`);
  }
  return [...new Set(value)];
};

const assertUuid = (value, field) => {
  if (!isValidUUID(value)) {
    throw new BadRequestError(`Invalid ${field}.`);
  }
  return value;
};

/** Resolves user UUIDs to user rows, failing if any is unknown. */
const resolveUsers = async (uuids, transaction) => {
  const users = await userRepository.findByUuids(uuids, transaction);
  if (users.length !== uuids.length) {
    const found = new Set(users.map((user) => user.user_id));
    const missing = uuids.filter((uuid) => !found.has(uuid));
    throw new NotFoundError(`User(s) not found: ${missing.join(", ")}`);
  }
  return users;
};

/** Resolves team UUIDs to team rows, failing if any is unknown. */
const resolveTeams = async (uuids, transaction) => {
  if (!uuids.length) return [];
  const teams = await teamRepository.findAll(
    { uuid: { [Op.in]: uuids } },
    [],
    true,
    ["id", "uuid", "name", "lead_id"],
    transaction,
  );
  if (teams.length !== uuids.length) {
    const found = new Set(teams.map((team) => team.uuid));
    const missing = uuids.filter((uuid) => !found.has(uuid));
    throw new NotFoundError(`Team(s) not found: ${missing.join(", ")}`);
  }
  return teams;
};

const findTeamOrThrow = async (teamUuid, transaction) => {
  assertUuid(teamUuid, "team uuid");
  const team = await teamRepository.findOne(
    { uuid: { [Op.eq]: teamUuid } },
    [],
    true,
    undefined,
    transaction,
  );
  if (!team) throw new NotFoundError("Team not found.");
  return team;
};

const assertNameAvailable = async (name, excludeTeamId, transaction) => {
  if (typeof name !== "string" || !name.trim()) {
    throw new BadRequestError("Team name is required.");
  }
  const existing = await teamRepository.findByNameInsensitive(name, transaction);
  if (existing && existing.id !== excludeTeamId) {
    throw new ConflictError(`A team named "${name.trim()}" already exists.`);
  }
};

const addMemberships = async (teamId, userIds, transaction) => {
  if (!userIds.length) return;
  await userTeamRepository.bulkCreate(
    userIds.map((user_id) => ({ user_id, team_id: teamId, manager_id: null })),
    { ignoreDuplicates: true, transaction },
  );
};

/**
 * Takes `userId` out of `teamIds`: their memberships go, and so does every line in
 * those teams where they are the report or the manager.
 */
const removeFromTeams = async (userId, teamIds, transaction) => {
  if (!teamIds.length) return 0;
  const memberships = await userTeamRepository.destroy(
    {
      user_id: { [Op.eq]: userId },
      team_id: { [Op.in]: teamIds },
      manager_id: { [Op.is]: null },
    },
    true,
    [],
    transaction,
  );
  await userTeamRepository.destroy(
    {
      team_id: { [Op.in]: teamIds },
      [Op.or]: [{ user_id: { [Op.eq]: userId } }, { manager_id: { [Op.eq]: userId } }],
    },
    true,
    [],
    transaction,
  );
  await teamRepository.update(
    { id: { [Op.in]: teamIds }, lead_id: { [Op.eq]: userId } },
    { lead_id: null },
    [],
    transaction,
  );
  return memberships;
};

// ───────────── Reporting lines ─────────────

/** Validates `[{ manager_uuid, team_uuid? }]`, dropping duplicates. */
const parseLines = (lines, field) => {
  if (!Array.isArray(lines)) {
    throw new BadRequestError(`${field} must be an array.`);
  }
  const seen = new Set();
  return lines.filter((line) => {
    if (!line || typeof line !== "object" || !isValidUUID(line.manager_uuid)) {
      throw new BadRequestError(`Each entry in ${field} needs a valid manager_uuid.`);
    }
    const teamUuid = line.team_uuid ?? null;
    if (teamUuid !== null && !isValidUUID(teamUuid)) {
      throw new BadRequestError(`Invalid team_uuid in ${field}: ${teamUuid}`);
    }
    const key = `${line.manager_uuid}:${teamUuid ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    line.team_uuid = teamUuid;
    return true;
  });
};

/**
 * Replaces the reporting lines of `user` (`{ id, name }`) with `lines`
 * (`[{ manager_uuid, team_uuid|null }]`). With `onlyGeneral`, only lines outside any
 * team are replaced and the user's team lines are left alone. Rejects inactive or
 * unknown managers, self-reporting, team lines between non-members, and cycles.
 */
const replaceManagerLines = async (user, lines, { onlyGeneral = false } = {}, transaction) => {
  const wanted = parseLines(lines, onlyGeneral ? "manager_uuids" : "managers");
  if (onlyGeneral && wanted.some((line) => line.team_uuid)) {
    throw new BadRequestError("manager_uuids only sets reporting lines outside teams.");
  }

  const managers = await resolveUsers(
    [...new Set(wanted.map((line) => line.manager_uuid))],
    transaction,
  );
  const managerByUuid = new Map(managers.map((manager) => [manager.user_id, manager]));
  for (const manager of managers) {
    if (manager.id === user.id) {
      throw new BadRequestError("A user cannot report to themselves.");
    }
    if (!manager.is_active) {
      throw new BadRequestError(
        `${manager.name} is deactivated and cannot be assigned as a manager.`,
      );
    }
  }

  const teams = await resolveTeams(
    [...new Set(wanted.map((line) => line.team_uuid).filter(Boolean))],
    transaction,
  );
  const teamByUuid = new Map(teams.map((team) => [team.uuid, team]));
  for (const team of teams) {
    const teamManagers = wanted
      .filter((line) => line.team_uuid === team.uuid)
      .map((line) => managerByUuid.get(line.manager_uuid));
    const members = await userTeamRepository.memberIds(
      team.id,
      [user.id, ...teamManagers.map((manager) => manager.id)],
      transaction,
    );
    if (!members.has(user.id)) {
      throw new BadRequestError(
        `${user.name} is not in ${team.name}, so they cannot report to anyone within it.`,
      );
    }
    const outsider = teamManagers.find((manager) => !members.has(manager.id));
    if (outsider) {
      throw new BadRequestError(
        `${outsider.name} is not in ${team.name}, so they cannot be a manager within it.`,
      );
    }
  }

  if (managers.length) {
    const below = new Set(await userTeamRepository.descendantIds(user.id, { transaction }));
    const cyclic = managers.find((manager) => below.has(manager.id));
    if (cyclic) {
      throw new BadRequestError(
        `${cyclic.name} already reports (directly or indirectly) to ${user.name}, so ${user.name} cannot report to them.`,
      );
    }
  }

  await userTeamRepository.destroy(
    {
      user_id: { [Op.eq]: user.id },
      manager_id: { [Op.ne]: null },
      ...(onlyGeneral && { team_id: { [Op.is]: null } }),
    },
    true,
    [],
    transaction,
  );
  const rows = wanted.map((line) => ({
    user_id: user.id,
    manager_id: managerByUuid.get(line.manager_uuid).id,
    team_id: line.team_uuid ? teamByUuid.get(line.team_uuid).id : null,
  }));
  if (rows.length) {
    await userTeamRepository.bulkCreate(rows, { ignoreDuplicates: true, transaction });
  }
};

exports.replaceManagerLines = replaceManagerLines;

/**
 * Replaces a user's team memberships with `teamUuids`. Leaving a team also drops
 * the reporting lines within it and clears the lead if they led it. Used by user
 * create/update.
 */
exports.syncUserTeams = async (userId, teamUuids, transaction) => {
  const uuids = assertUuidArray(teamUuids, "team_uuids");
  const teams = await resolveTeams(uuids, transaction);
  const teamIds = teams.map((team) => team.id);

  const leaving = await userTeamRepository.findAll(
    {
      user_id: { [Op.eq]: userId },
      manager_id: { [Op.is]: null },
      ...(teamIds.length && { team_id: { [Op.notIn]: teamIds } }),
    },
    [],
    true,
    ["team_id"],
    transaction,
  );
  await removeFromTeams(
    userId,
    leaving.map((membership) => membership.team_id),
    transaction,
  );

  if (teamIds.length) {
    await userTeamRepository.bulkCreate(
      teamIds.map((team_id) => ({ user_id: userId, team_id, manager_id: null })),
      { ignoreDuplicates: true, transaction },
    );
  }
};

exports.assertUuidArray = assertUuidArray;

// ───────────── Teams ─────────────

exports.getFilteredTeams = async (payload) => {
  const { search = "", page = 1, limit = 10 } = payload.query;

  if (payload.headers.is_filter === "true") {
    return teamRepository.listAllTeams({ search });
  }
  return teamRepository.listTeams({ search, page, limit });
};

exports.getTeamById = async (payload) => {
  const { team_uuid } = payload.params;
  assertUuid(team_uuid, "team uuid");
  const team = await teamRepository.getTeamDetail(team_uuid);
  if (!team) throw new NotFoundError("Team not found.");
  const lines = await userTeamRepository.findLines({ teamId: team.id });
  return { team, lines };
};

exports.createTeam = async (payload) => {
  const { name, description, lead_uuid, member_uuids = [] } = payload.body;

  const memberUuids = assertUuidArray(member_uuids, "member_uuids");
  if (lead_uuid !== undefined && lead_uuid !== null) {
    assertUuid(lead_uuid, "lead_uuid");
    if (!memberUuids.includes(lead_uuid)) memberUuids.push(lead_uuid);
  }

  const transaction = await transactionRepository.startTransaction();
  try {
    await assertNameAvailable(name, null, transaction);
    const members = await resolveUsers(memberUuids, transaction);
    const lead = lead_uuid
      ? members.find((member) => member.user_id === lead_uuid)
      : null;

    const team = await teamRepository.create(
      { name, description, lead_id: lead ? lead.id : null },
      { transaction },
    );
    await addMemberships(
      team.id,
      members.map((member) => member.id),
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
    return team;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.updateTeam = async (payload) => {
  const { team_uuid } = payload.params;
  const { name, description, lead_uuid } = payload.body;

  const transaction = await transactionRepository.startTransaction();
  try {
    const team = await findTeamOrThrow(team_uuid, transaction);
    const updates = {};

    if (name !== undefined) {
      await assertNameAvailable(name, team.id, transaction);
      updates.name = name;
    }
    if (description !== undefined) updates.description = description;

    if (lead_uuid === null) {
      updates.lead_id = null;
    } else if (lead_uuid !== undefined) {
      assertUuid(lead_uuid, "lead_uuid");
      const [lead] = await resolveUsers([lead_uuid], transaction);
      // A lead is always a member of the team they lead.
      await addMemberships(team.id, [lead.id], transaction);
      updates.lead_id = lead.id;
    }

    if (Object.keys(updates).length) {
      await teamRepository.update(
        { id: { [Op.eq]: team.id } },
        updates,
        [],
        transaction,
      );
    }

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.deleteTeam = async (payload) => {
  const { team_uuid } = payload.params;

  const transaction = await transactionRepository.startTransaction();
  try {
    const team = await findTeamOrThrow(team_uuid, transaction);
    await userTeamRepository.destroy(
      { team_id: { [Op.eq]: team.id } },
      true,
      [],
      transaction,
    );
    await teamRepository.update(
      { id: { [Op.eq]: team.id } },
      { lead_id: null },
      [],
      transaction,
    );
    await teamRepository.destroy({ id: { [Op.eq]: team.id } }, false, [], transaction);

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

// ───────────── Members ─────────────

exports.addTeamMembers = async (payload) => {
  const { team_uuid } = payload.params;
  const userUuids = assertUuidArray(payload.body.user_uuids, "user_uuids");
  if (!userUuids.length) {
    throw new BadRequestError("user_uuids must contain at least one UUID.");
  }

  const transaction = await transactionRepository.startTransaction();
  try {
    const team = await findTeamOrThrow(team_uuid, transaction);
    const users = await resolveUsers(userUuids, transaction);
    await addMemberships(
      team.id,
      users.map((user) => user.id),
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.removeTeamMember = async (payload) => {
  const { team_uuid, user_uuid } = payload.params;
  assertUuid(user_uuid, "user uuid");

  const transaction = await transactionRepository.startTransaction();
  try {
    const team = await findTeamOrThrow(team_uuid, transaction);
    const [user] = await resolveUsers([user_uuid], transaction);

    const removed = await removeFromTeams(user.id, [team.id], transaction);
    if (!removed) {
      throw new NotFoundError("User is not a member of this team.");
    }

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};
