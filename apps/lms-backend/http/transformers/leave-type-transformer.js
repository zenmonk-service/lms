class LeaveTypeTransformer {
  static transformFilter(rows) {
    return rows.map((row) => ({
      uuid: row.uuid,
      name: row.name,
      is_active: row.is_active,
    }));
  }

  static transformMe(rows) {
    return rows.map((row) => {
      const {
        transfer_leave_type,
        users,
        roles,
        leave_balances,
        id,
        ...restPayload
      } = row;

      return restPayload;
    });
  }
}

module.exports = LeaveTypeTransformer;
