const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { memberUserIncludes } = require("./common/query-includes");

class QueryMemberRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.query_members,
    });
    this.tenantModel = (model) => this.tenant(model);
  }

  async getMembersByQueryId(queryId, transaction) {
    return this.findAll(
      { query_id: { [Op.eq]: queryId } },
      memberUserIncludes(this.tenantModel),
      true,
      undefined,
      transaction,
      { order: [["assigned_at", "ASC"]] },
    );
  }

  async getMemberByUUID(memberUUID, transaction) {
    return this.findOne(
      { uuid: { [Op.eq]: memberUUID } },
      memberUserIncludes(this.tenantModel),
      undefined,
      undefined,
      transaction,
    );
  }

  /** A member row of this query, by the member's uuid or by the member user's numeric id. */
  async findMemberInQuery(queryId, { memberUUID, userId }) {
    const criteria = { query_id: { [Op.eq]: queryId } };
    if (memberUUID) criteria.uuid = { [Op.eq]: memberUUID };
    if (userId) criteria.user_id = { [Op.eq]: userId };
    return this.findOne(criteria);
  }

  /** Adds users to a query with one role. `userIds` are numeric user ids. */
  async createMembers(
    { query_id, user_ids, role, assigned_by, assigned_at = new Date() },
    transaction,
  ) {
    return this.bulkCreate(
      user_ids.map((user_id) => ({
        query_id,
        user_id,
        role,
        assigned_by,
        assigned_at,
      })),
      { transaction },
    );
  }

  /**
   * Permanent delete: the (query, user, role) unique index must allow adding the
   * same user again later.
   */
  async deleteMemberById(memberId, transaction) {
    return this.destroy({ id: { [Op.eq]: memberId } }, true, [], transaction);
  }

  /** Permanent delete of every member of a query (used when the query is deleted). */
  async deleteMembersByQueryId(queryId, transaction) {
    return this.destroy(
      { query_id: { [Op.eq]: queryId } },
      true,
      [],
      transaction,
    );
  }
}

module.exports = {
  queryMemberRepository: new QueryMemberRepository({
    sequelize: db.sequelize,
  }),
};
