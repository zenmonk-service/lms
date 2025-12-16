"use strict";

module.exports = {
  async up(queryInterface, Sequelize, schema) {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM "${schema}"."role";`
    );
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id FROM "${schema}"."permission";`
    );

    const adminRole = roles.find((r) => r.name === "Admin");
    if (!adminRole) {
      throw new Error("Admin role not found. Please run the role seeder first.");
    }

    const rolePermissions = permissions.map((perm) => ({
      role_id: adminRole.id,
      permission_id: perm.id,
    }));

    await queryInterface.bulkInsert(
      { tableName: "role_permission", schema },
      rolePermissions
    );
  },

  async down(queryInterface, Sequelize, schema) {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT uuid, name FROM "${schema}"."role";`
    );
    const adminRole = roles.find((r) => r.name === "Admin");

    if (adminRole) {
      await queryInterface.bulkDelete(
        { tableName: "role_permission", schema },
        { role_id: adminRole.uuid }
      );
    }
  },
};
