class UserTransformer {
  static transformMeResponse(rows) {
    return rows.map((row) => {
      return {
        user_id: row.user_id,
        name: row.name,
        email: row.email,
      };
    });
  }

  static transformFilterResponse(rows) {
    return rows.map((row) => {
      return {
        user_id: row.user_id,
        name: row.name,
        email: row.email,
      };
    });
  }
}

module.exports = UserTransformer;
