class UserTransformer {
  static transformMeResponse(rows) {
    return rows.map((row) => {
      return {
        user_id: row.user_id,
        name: row.name,
      };
    });
  }

  static transformFilterResponse(rows) {
    return rows.map((row) => {
      return {
        user_id: row.user_id,
        name: row.name,
      };
    });
  }
}

module.exports = UserTransformer;
