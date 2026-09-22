class RoleTransformer {
  static transformFilter(rows) {
    return rows.map((row) => ({
      uuid: row.uuid,
      name: row.name,
      code: row.code
    }));
  }
}

module.exports = RoleTransformer;
