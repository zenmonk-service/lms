const { BaseRepository } = require("./base-repository");
const db = require("../models");

class LeaveBalanceLogRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_balance_log,
    });
  }

  /**
   * Write one audit row per balance change.
   * @param {Array<{leave_balance_id:number, leave_balance_deducted:number, source:string, leave_request_id?:number|null}>} entries
   */
  async logChanges(entries, transaction) {
    const rows = (entries || []).filter((e) => e && e.leave_balance_id != null);
    if (!rows.length) return [];

    return this.bulkCreate(
      rows.map((e) => ({
        leave_request_id: e.leave_request_id ?? null,
        leave_balance_id: e.leave_balance_id,
        leave_balance_deducted: e.leave_balance_deducted,
        source: e.source,
      })),
      { transaction },
    );
  }

  /**
   * Convenience for freshly-created balance rows: the whole balance is a credit,
   * so it is logged as a negative deduction.
   * @param {Array<{id:number, balance:number|string}>} balances - created leave_balance instances
   */
  async logAllocations(balances, source, transaction) {
    return this.logChanges(
      (balances || []).map((b) => ({
        leave_balance_id: b.id,
        leave_balance_deducted: -Number(b.balance ?? 0),
        source,
      })),
      transaction,
    );
  }
}

module.exports = {
  leaveBalanceLogRepository: new LeaveBalanceLogRepository({
    sequelize: db.sequelize,
  }),
};
