const { Sequelize } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

/**
 * user_team rows are either a team membership (`manager_id` null) or a reporting
 * line (`manager_id` set, `team_id` set for a line that applies within a team).
 */
class UserTeamRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user_team,
    });
  }

  async _select(sql, replacements, transaction) {
    return this.sequelize.query(sql, {
      replacements,
      transaction,
      type: Sequelize.QueryTypes.SELECT,
    });
  }

  /** Reporting lines between non-deleted users, with manager and team details. */
  _linesSql(where) {
    const s = this.schema;
    return `SELECT ut.user_id, ut.manager_id, ut.team_id,
                   u.user_id AS user_uuid, m.user_id AS manager_uuid,
                   m.name AS manager_name, m.email AS manager_email, m.image AS manager_image,
                   t.uuid AS team_uuid, t.name AS team_name
            FROM "${s}"."user_team" ut
            JOIN "${s}"."user" u ON u.id = ut.user_id AND u.deleted_at IS NULL
            JOIN "${s}"."user" m ON m.id = ut.manager_id AND m.deleted_at IS NULL
            LEFT JOIN "${s}"."team" t ON t.id = ut.team_id
            WHERE ut.manager_id IS NOT NULL
              AND (ut.team_id IS NULL OR t.deleted_at IS NULL)
              ${where}
            ORDER BY m.name, t.name NULLS FIRST`;
  }

  /** Reporting lines of the given reports (`userIds`), or all lines when omitted. */
  async findLines({ userIds, teamId } = {}, transaction) {
    if (userIds && !userIds.length) return [];
    const where = [
      userIds ? "AND ut.user_id IN (:userIds)" : "",
      teamId ? "AND ut.team_id = :teamId" : "",
    ].join(" ");
    return this._select(
      this._linesSql(where),
      { userIds: userIds ?? null, teamId: teamId ?? null },
      transaction,
    );
  }

  /** Ids of the given users that are members of `teamId`. */
  async memberIds(teamId, userIds, transaction) {
    if (!userIds.length) return new Set();
    const rows = await this._select(
      `SELECT user_id FROM "${this.schema}"."user_team"
       WHERE team_id = :teamId AND manager_id IS NULL AND user_id IN (:userIds)`,
      { teamId, userIds },
      transaction,
    );
    return new Set(rows.map((row) => row.user_id));
  }

  /**
   * Ids of everyone below `userId` through any reporting line (optionally only lines
   * within `teamId`), excluding `userId`. The path array stops the walk on a cycle.
   */
  async descendantIds(userId, { teamId, transaction } = {}) {
    const s = this.schema;
    const teamCondition = teamId ? "AND l.team_id = :teamId" : "";
    const rows = await this._select(
      `WITH RECURSIVE down AS (
         SELECT :userId::int AS id, ARRAY[:userId::int] AS path
         UNION ALL
         SELECT l.user_id, d.path || l.user_id
         FROM "${s}"."user_team" l
         JOIN down d ON l.manager_id = d.id
         JOIN "${s}"."user" u ON u.id = l.user_id AND u.deleted_at IS NULL
         WHERE l.user_id <> ALL(d.path) ${teamCondition}
       )
       SELECT DISTINCT id FROM down WHERE id <> :userId`,
      { userId, teamId: teamId ?? null },
      transaction,
    );
    return rows.map((row) => row.id);
  }

  /** Everyone above `userId` as `{ id, level }`, level = shortest distance (1 = direct). */
  async ancestors(userId) {
    const s = this.schema;
    return this._select(
      `WITH RECURSIVE up AS (
         SELECT :userId::int AS id, 0 AS level, ARRAY[:userId::int] AS path
         UNION ALL
         SELECT l.manager_id, u.level + 1, u.path || l.manager_id
         FROM "${s}"."user_team" l
         JOIN up u ON l.user_id = u.id
         JOIN "${s}"."user" m ON m.id = l.manager_id AND m.deleted_at IS NULL
         WHERE l.manager_id IS NOT NULL AND l.manager_id <> ALL(u.path)
       )
       SELECT id, MIN(level)::int AS level FROM up WHERE level > 0
       GROUP BY id ORDER BY level, id`,
      { userId },
    );
  }

  /** Map of manager id → number of distinct direct reports (lines within `teamId`, if given). */
  async reportCounts(managerIds, teamId) {
    if (!managerIds.length) return new Map();
    const rows = await this._select(
      `SELECT l.manager_id, COUNT(DISTINCT l.user_id)::int AS count
       FROM "${this.schema}"."user_team" l
       JOIN "${this.schema}"."user" u ON u.id = l.user_id AND u.deleted_at IS NULL
       WHERE l.manager_id IN (:managerIds) ${teamId ? "AND l.team_id = :teamId" : ""}
       GROUP BY l.manager_id`,
      { managerIds, teamId: teamId ?? null },
    );
    return new Map(rows.map((row) => [row.manager_id, row.count]));
  }

  /** Number of active users with a line to `managerId`. */
  async countActiveReports(managerId, transaction) {
    const [row] = await this._select(
      `SELECT COUNT(DISTINCT l.user_id)::int AS count
       FROM "${this.schema}"."user_team" l
       JOIN "${this.schema}"."user" u
         ON u.id = l.user_id AND u.deleted_at IS NULL AND u.is_active
       WHERE l.manager_id = :managerId`,
      { managerId },
      transaction,
    );
    return row.count;
  }
}

module.exports = {
  userTeamRepository: new UserTeamRepository({
    sequelize: db.sequelize,
  }),
};
